"""
Agent Orchestrator for Export Compliance Agent
----------------------------------------------
Handles intent inference, tool execution, and response synthesis.
Uses Gemini 3 Pro for finding intent and generating natural language answers.
"""
import os
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from data_models import ShipmentCase, AgentResponse, LicenseResult, ScreeningResult, AgentMessage

# Import existing engines
from license_exceptions_engine import run_license_exception_engine
from forced_labour_screening import screen_forced_labour
from dps_service import screen_party

# Configure Gemini
# Global fallback (legacy) - prefer injection
# We will remove the top-level configuration to avoid confusion/errors at import time.

class AgentOrchestrator:
    def __init__(self, model: Optional[genai.GenerativeModel] = None):
        self.model = model

    def infer_intent(self, messages: List[Dict[str, str]], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Uses LLM to infer user intent and extract structured data.
        Returns a dict with 'intent', 'shipment_updates', 'missing_fields', 'needs_clarification'.
        """
        if not self.model:
            return {"intent": "general_qa", "shipment_updates": {}, "missing_fields": [], "needs_clarification": False}

        # Safer message processing
        history_lines = []
        for m in messages[-4:]:
            role = m.get('role', 'user')
            content = m.get('content', '')
            history_lines.append(f"{role}: {content}")
        
        history_text = "\n".join(history_lines)
        current_data = json.dumps(context)
        
        prompt = f"""
        Act as an Export Compliance Agent Router.
        Analyze the conversation history and current shipment context.
        
        Current Shipment Context: {current_data}
        
        Conversation History:
        {history_text}
        
        Your Goal:
        1. Determine the INTENT:
           - 'license_check': User wants to check export license requirements. Also use this if user is providing specific shipment data (e.g. "Value is 5000").
           - 'screening': User wants to screen a party (DPS) or supplier (UFLPA).
           - 'full_check': User provided enough data for a full shipment evaluation.
           - 'general_qa': User is asking a general regulatory question.
           - 'update_details': User explicitly REQUESTS to add/edit details (e.g. "I want to add details", "Let me update"). Do NOT use this if user is just providing the data values.
        
        2. Extract ENTITIES to update the context:
           - eccn (e.g. 5A002, 3A090), destination, value, end_user_type, end_user_name, supplier_name, commodity_description, origin_country.
           - end_use (purpose), is_reexport (boolean), unit (e.g. kg, lbs, units).
           
        3. Identify MISSING CRITICAL FIELDS based on intent:
           - Check 'Current Shipment Context' first. IF values exist there, they are NOT missing.
           - If intent is 'license_check' OR 'full_check':
             - Missing 'eccn'? (Only if context.eccn is empty/null)
             - Missing 'destination'? (Only if context.destination is empty/null)
             - Missing 'value'? (Only if context.value is empty/null)
             - Missing 'end_use'? (Only if context.end_use is empty/null)
             - Missing 'end_user_name'? (Only if context.end_user_name is empty/null)
             - Missing 'commodity_description'? (Only if context.commodity_description is empty/null)
           - If intent is 'screening':
             - Missing 'end_user_name' OR 'supplier_name'?
           - Always list ALL missing fields found.
           
           CRITICAL: EXTRACT 'supplier_name' IF MENTIONED (e.g. "Supplier is X", "Vendor Y", "Made by Z").
           CRITICAL: EXTRACT 'origin_country' IF MENTIONED (e.g. "From China", "Origin: CN").

        4. Output JSON ONLY:
        {{
            "intent": "...",
            "shipment_updates": {{ "field": "value" }},
            "missing_fields": ["eccn", "destination", "value", "end_use", "end_user_name"], 
            "needs_clarification": true/false
        }}
        """
        
        try:
            print(f"DEBUG: calling intent LLM with history size {len(history_lines)}", flush=True)
            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            print("DEBUG: Intent LLM responded", flush=True)
            parsed = json.loads(response.text)
            print(f"DEBUG: Parsed Extraction: {json.dumps(parsed)}", flush=True) # DEBUG LOG
            
            # Double Check: Remove fields from 'missing_fields' if they are already in the context
            # This is the "No Looping" enforcement layer
            final_missing = []
            updates = parsed.get('shipment_updates', {})
            
            for field in parsed.get('missing_fields', []):
                # Check if it's in existing context OR in the new updates
                # Map field names if necessary (e.g. 'destination' vs 'destination_country')
                has_value_in_context = context.get(field) or context.get(field.lower()) or context.get(field.replace('_', ''))
                has_value_in_updates = updates.get(field) or updates.get(field.lower())
                
                if not has_value_in_context and not has_value_in_updates:
                    final_missing.append(field)

            # FORCE CHECK: Programmatically ensure extended fields are requested if intent is relevant
            # This bypasses LLM randomness to satisfy user requirement for "End User" etc.
            if parsed['intent'] in ['license_check', 'full_check']:
                required_extended = ['end_use', 'end_user_name', 'commodity_description']
                for req in required_extended:
                    has_val = context.get(req) or updates.get(req)
                    if not has_val and req not in final_missing:
                         final_missing.append(req)
            
            parsed['missing_fields'] = final_missing
            
            # Special logic: If no missing fields for license check, upgrade intent
            if parsed['intent'] == 'license_check' and not final_missing:
                parsed['intent'] = 'full_check'

            return parsed
        except Exception as e:
            print(f"Intent Inference Error: {e}")
            # Fallback to general QA if inference fails
            return {"intent": "general_qa", "shipment_updates": {}, "missing_fields": [], "needs_clarification": False}

    def execute_tools(self, intent: str, shipment: ShipmentCase) -> Dict[str, Any]:
        """
        Runs appropriate internal engines safely.
        """
        results = {
            "license": None,
            "dps": None,
            "uflpa": None
        }
        
        # License Check
        if intent in ['license_check', 'full_check']:
            # Require minimum viable data to run engine
            if shipment.eccn and shipment.destination:
                try:
                    lic_data = run_license_exception_engine(
                        shipment.eccn, 
                        shipment.destination, 
                        shipment.value or 0, 
                        shipment.end_user_type
                    )
                    results['license'] = LicenseResult(
                        status=lic_data['status'],
                        exceptions=lic_data.get('results', []),
                        trace=lic_data['trace'],
                        details={"eccn_description": lic_data.get('eccn_description')}
                    )
                except Exception as e:
                    print(f"License Engine Error: {e}")
        
        # DPS
        if intent in ['screening', 'full_check'] or shipment.end_user_name:
            if shipment.end_user_name:
                try:
                    dps_data = screen_party(shipment.end_user_name)
                    results['dps'] = ScreeningResult(
                        engine="DPS",
                        outcome=dps_data['status'], 
                        risk_level=dps_data['status'] if dps_data['status'] != 'CLEAR' else 'LOW',
                        matches=dps_data.get('matches', []),
                        reasoning=[dps_data.get('message', '')]
                    )
                except Exception as e:
                    print(f"DPS Error: {e}")
            else:
                # Explicit UNKNOWN for clarity (Enterprise Requirement)
                results['dps'] = ScreeningResult(
                    engine="DPS",
                    outcome="UNKNOWN",
                    risk_level="UNKNOWN",
                    matches=[],
                    reasoning=["End-user missing. Screening not run."]
                )

        # UFLPA
        if intent in ['screening', 'full_check'] or (shipment.supplier_name or shipment.origin_country):
            if shipment.supplier_name or shipment.commodity_description or shipment.origin_country:
                try:
                    uflpa_data = screen_forced_labour(
                        shipment.supplier_name or "",
                        shipment.commodity_description or "",
                        shipment.origin_country or "",
                        "" # region
                    )
                    results['uflpa'] = ScreeningResult(
                        engine="UFLPA",
                        outcome="WARNING" if uflpa_data['risk_level'] != 'CLEAR' else 'CLEAR',
                        risk_level=uflpa_data['risk_level'],
                        matches={'match': uflpa_data.get('matches', {})},
                        reasoning=uflpa_data.get('reasons', [])
                    )
                except Exception as e:
                     print(f"UFLPA Error: {e}")
            else:
                # Explicit UNKNOWN for clarity (Enterprise Requirement)
                results['uflpa'] = ScreeningResult(
                     engine="UFLPA",
                     outcome="UNKNOWN",
                     risk_level="UNKNOWN",
                     matches=[],
                     reasoning=["Supplier/Commodity missing. Traceability not run."]
                )
                
        return results

    def build_logic_trace(self, shipment: ShipmentCase, tool_results: Dict[str, Any]) -> Dict[str, Any]:
        """Constructs a secure logic trace with links."""
        steps = []
        if shipment.eccn:
            # TODO: In real app, these links would be dynamic based on catalog
            steps.append({"step": "1. Identification", "detail": f"ECCN Identified as {shipment.eccn}", "citation": "Category 5", "url": "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-774/supplement-no.-1"})
        if shipment.destination:
            steps.append({"step": "2. Destination Control", "detail": f"Destination: {shipment.destination}", "citation": "Country Group B", "url": "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/supplement-no.-1"})
        
        # License Logic
        if tool_results.get('license'):
            res = tool_results['license']
            steps.append({"step": "3. License Determination", "detail": f"Status: {res.status}", "citation": "§740.17" if "ENC" in str(res.exceptions) else "§738.4", "url": "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.17"})
            if res.exceptions:
                steps.append({"step": "4. Exception Review", "detail": f"Eligible for: {[e['code'] for e in res.exceptions]}", "citation": "§740.x", "url": "https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740"})
        
        # Screening Logic
        if tool_results.get('dps'):
            dps = tool_results['dps']
            outcome_text = dps.outcome
            if dps.outcome == "UNKNOWN": outcome_text = "Skipped (Missing Data)"
            steps.append({"step": "5. Restricted Party Request", "detail": f"Screened '{shipment.end_user_name or 'Unknown'}': {outcome_text}", "citation": "Consolidated Screening List", "url": "https://www.trade.gov/consolidated-screening-list"})
            
        return {"title": "Compliance Logic Trace", "steps": steps}
    
    def generate_next_steps(self, tool_results):
        actions = []
        # Logic to suggest next steps
        if tool_results.get('license'):
             # Return structured actions for ActionButtons.jsx
             actions.append({"label": "Download PDF", "type": "pdf"})
             actions.append({"label": "Email Summary", "type": "email"})
        
        return actions

    def process_request(self, messages: List[Dict[str, str]], current_shipment: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Infer Intent
        inference = self.infer_intent(messages, current_shipment)
        intent = inference.get('intent', 'general_qa')
        updates = inference.get('shipment_updates') or {}
        missing_fields = inference.get('missing_fields') or []
        needs_clarification = inference.get('needs_clarification', False)
        
        # 2. Update Shipment Case
        normalized_data = {}
        combined_data = {**current_shipment, **updates}
        
        for k, v in combined_data.items():
            key = k.lower()
            if 'user' in key and 'type' in key: normalized_data['end_user_type'] = v
            elif 'user' in key and 'name' in key: normalized_data['end_user_name'] = v
            elif 'supplier' in key: normalized_data['supplier_name'] = v
            elif 'commodity' in key or 'prod' in key: normalized_data['commodity_description'] = v
            elif 'origin' in key: normalized_data['origin_country'] = v
            elif 'use' in key and 'end' in key and 'type' not in key and 'name' not in key: normalized_data['end_use'] = v
            elif 'reexport' in key: normalized_data['is_reexport'] = str(v).lower() == 'true'
            elif 'unit' in key: normalized_data['unit'] = v
            elif key == 'valueusd': 
                try:
                    normalized_data['value'] = float(str(v).replace('$', '').replace(',', ''))
                except:
                    normalized_data['value'] = 0.0
            else: normalized_data[k] = v 
            
        shipment = ShipmentCase(**{k: v for k, v in normalized_data.items() if k in ShipmentCase.__annotations__})
        
        # 3. Execute Tools
        tool_results = {"license": None, "dps": None, "uflpa": None}
        if intent != 'general_qa':
            tool_results = self.execute_tools(intent, shipment)
            
        # 4. Build Structured Messages (ENTERPRISE SINGLE BUBBLE MODEL)
        messages_list = []
        mood = "idle"

        # --- BUBBLE 1: CONFIRMED INPUTS (Visual Context State) ---
        confirmed_chips = []
        if shipment.eccn: confirmed_chips.append({"label": f"ECCN {shipment.eccn}", "status": "valid"})
        if shipment.destination: confirmed_chips.append({"label": f"Dest: {shipment.destination}", "status": "valid"})
        if shipment.value: confirmed_chips.append({"label": f"Val: ${shipment.value}", "status": "valid"})
        if shipment.end_user_name: confirmed_chips.append({"label": f"End User: {shipment.end_user_name}", "status": "valid"})
        
        if confirmed_chips:
            messages_list.append(AgentMessage(role="assistant", kind="confirmation_chips", data={"chips": confirmed_chips}))


        # --- BUBBLE 2: SUMMARY & CONTENT CONTENT ---
        
        # 1. Check for HIGH RISK Findings (Priority)
        # If we have a BLOCK/WARNING from DPS or UFLPA, show that immediately/first.
        critical_risk = False
        if tool_results.get('dps') and tool_results['dps'].outcome in ['MATCH', 'BLOCKED']: critical_risk = True
        if tool_results.get('uflpa') and tool_results['uflpa'].outcome == 'WARNING': critical_risk = True

        # SCENARIO A: MISSING CRITICAL INFO (Requirements Pack)
        # Only show if NO critical risk found. If critical risk, we skip to verdict.
        # FIX: Only block if *mandatory* fields are missing. Optional fields (Value, End Use) should not block.
        
        mandatory_fields = []
        if intent in ['license_check', 'full_check']:
            mandatory_fields = ['eccn', 'destination']
        elif intent == 'screening':
            mandatory_fields = ['end_user_name'] # At least one name needed
            
        is_blocked_by_missing = any(f in missing_fields for f in mandatory_fields)
        
        # User explicit request to update details -> Force Requirements Pack
        force_update = (intent == 'update_details')

        # Logic Update: Even if LLM says 'needs_clarification', if we have the mandatory fields, 
        # we OVERRIDE it and proceed to verdict (treating others as truly optional).
        # We only block if 'is_blocked_by_missing' is True OR if explicitly requested.
        
        if (is_blocked_by_missing or force_update) and not critical_risk:
            mood = "warning"
            # 1. Summary
            summary = "**I can run the full export compliance assessment. A few key details are missing.**"
            if force_update: summary = "**Sure, let's update the assessment details.**"
            messages_list.append(AgentMessage(role="assistant", kind="text", content=summary))

            # 2. Requirements Pack
            # We map missing fields to labels
            req_list = []
            # If forcing update, show ALL missing fields (even optional ones)
            # If missing_fields is empty (e.g. initial optional pass), default to common optional fields
            fields_to_show = missing_fields if missing_fields else ['value', 'end_use', 'end_user_name', 'commodity_description'] 
            
            # Ensure Value is present if it's 0 (default) and we are refining
            if force_update and 'value' not in fields_to_show and shipment.value == 0:
                fields_to_show.insert(0, 'value')
            
            for f in fields_to_show:
                is_required = f in mandatory_fields
                label = f.capitalize().replace('_', ' ')
                req_list.append({"field": f, "label": label, "required": is_required})
            
            # Metadata for the form
            form_data = {
                "missing_items": req_list,
                "isOptional": force_update, # If forced update (refinement), it's optional
                "title": "Refine Assessment Details" if force_update else "Additional Details Required"
            }
            
            messages_list.append(AgentMessage(role="assistant", kind="requirements_pack", data=form_data))

        # SCENARIO B: ANALYSIS RESULTS (Verdict Card + Risk Box)
        # Show if (Risk Found) OR (Intent is valid AND we are not strictly blocked)
        elif (intent != 'general_qa' and not is_blocked_by_missing) or critical_risk:
            # Determine Overall Status
            status = "CLEAN"
            risk_level = "LOW"
            
            # Logic: If restricted license or bad screening, escalate risk
            if tool_results.get('license') and tool_results['license'].status == 'RESTRICTED':
                status = "RESTRICTED"; risk_level = "HIGH"
            
            # DPS/UFLPA logic
            dps_res = tool_results.get('dps')
            uflpa_res = tool_results.get('uflpa')
            
            if dps_res and dps_res.outcome in ['MATCH', 'BLOCKED']:
                status = "BLOCKED"; risk_level = "CRITICAL"
            elif dps_res and dps_res.outcome == 'UNKNOWN':
                 # Missing end user doesn't make it CRITICAL, but implies incomplete check
                 pass 

            if uflpa_res and uflpa_res.outcome == 'WARNING':
                status = "WARNING"; risk_level = "HIGH"

            mood = "success" if risk_level == "LOW" else "warning"
            if risk_level == "CRITICAL": mood = "danger"

            # 1. Summary Bubble
            summary_text = "**Full assessment complete.** Here is the compliance breakdown."
            messages_list.append(AgentMessage(role="assistant", kind="text", content=summary_text))

            # 2. Verdict Card (New)
            messages_list.append(AgentMessage(
                role="assistant", kind="verdict_card",
                data={"status": status, "risk_level": risk_level, "summary": f"Shipment to {shipment.destination}"}
            ))

            # 3. Exception Grid
            if tool_results['license'] and tool_results['license'].exceptions:
                messages_list.append(AgentMessage(role="assistant", kind="exception_grid", data={"exceptions": tool_results['license'].exceptions}))

            # 4. Risk Box (Updated for UNKNOWNs)
            messages_list.append(AgentMessage(role="assistant", kind="risk_box",
                data={
                    "dps": tool_results['dps'].to_dict() if tool_results['dps'] else None,
                    "uflpa": tool_results['uflpa'].to_dict() if tool_results['uflpa'] else None,
                    "sanctions": {"status": "CLEAR", "country": shipment.destination} # simplified
                }
            ))

            # 5. Optimization Tip (Accuracy Suggestion) - [NEW]
            # Identify purely optional empty fields
            optional_missing = [f for f in missing_fields if f not in ['eccn', 'destination']]
            if optional_missing and risk_level != "CRITICAL":
                # Only suggest if not already blocked.
                tips = []
                if 'value' in optional_missing: tips.append("Add Value to check LVS exception eligibility.")
                if 'end_user_name' in optional_missing: tips.append("Add End User for restricted party screening.")
                if 'end_use' in optional_missing: tips.append("Add End Use to verify military/WHEE restrictions.")
                
                if tips:
                     messages_list.append(AgentMessage(
                        role="assistant", 
                        kind="optimization_tip", 
                        data={"missing_fields": optional_missing, "tips": tips}
                    ))

            # 6. Logic & Next Steps
            messages_list.append(AgentMessage(role="assistant", kind="logic_trace", data=self.build_logic_trace(shipment, tool_results)))
            messages_list.append(AgentMessage(role="assistant", kind="next_steps", data={"actions": self.generate_next_steps(tool_results)}))

        # SCENARIO C: GENERAL QA
        else:
            mood = "idle"
            qa_prompt = f"Act as an export compliance expert. Answer this strictly in 2 short sentences. No fluff. Question: {messages[-1].get('content', '')}"
            narrative = "I cannot answer that."
            try:
                if self.model:
                    resp = self.model.generate_content(qa_prompt); narrative = resp.text.strip()
            except: pass
            messages_list.append(AgentMessage(role="assistant", kind="text", content=narrative))
            
        return AgentResponse(shipment=shipment, messages=messages_list, mood=mood, intent=intent, needs_clarification=needs_clarification, missing_fields=missing_fields).to_dict()
