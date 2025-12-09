
"""
Flask Backend for Export Compliance Assistant
"""
import os
import json
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Import New Engines
from license_exceptions_engine import run_license_exception_engine, get_all_countries
from forced_labour_screening import screen_forced_labour
from dps_service import screen_party # Keeping DPS as experimental/separate for now
from agent_orchestrator import AgentOrchestrator


# Import Utils
from chat_agent import get_chat_response, add_message, log_audit_event
from export_utils import generate_report_data, generate_pdf_report, format_report_as_text, format_report_as_json



app = Flask(__name__)
# Enable CORS to allow requests from the React frontend (likely on port 3555 or 5173)
CORS(app)

# Configure Gemini
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')  # Faster than gemini-3-pro-preview
    print(f"DEBUG: GOOGLE_API_KEY loaded: {GOOGLE_API_KEY[:5]}...", flush=True)
else:
    model = None
    print("WARNING: No GOOGLE_API_KEY found. AI features disabled.")

# Initialize Orchestrator
# Initialize Orchestrator
orchestrator = AgentOrchestrator(model=model)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check for readiness probes."""
    return jsonify({"status": "healthy", "service": "export-compliance-backend"}), 200


@app.route('/agent', methods=['POST'])
def agent_endpoint():
    print("DEBUG: Entered agent_endpoint", flush=True)
    """
    Main Agent Endpoint.
    Orchestrates logic based on refined ShipmentCase and intent.
    Input: { "messages": [...], "context": {...} }
    Output: AgentResponse JSON
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    messages = data.get('messages', [])
    context = data.get('context', {})
    
    # Process via Orchestrator
    try:
        response = orchestrator.process_request(messages, context)
        return jsonify(response)
    except Exception as e:
        print(f"Agent Error: {e}")
        return jsonify({"error": str(e), "message": "An error occurred while processing your request."}), 500

@app.route('/countries', methods=['GET'])
def get_countries():
    """Return list of all available countries."""
    return jsonify({"countries": get_all_countries()})

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # 1. License Exception Engine
    # ---------------------------
    eccn = data.get('eccn', '')
    destination = data.get('destination', '')
    value = float(data.get('value', 0))
    end_user_type = data.get('endUserType', 'Commercial')
    
    license_outcome = run_license_exception_engine(eccn, destination, value, end_user_type)
    
    # 2. Forced Labour Screening (UFLPA)
    # ----------------------------------
    # Only run if toggled ON or specific fields provided? 
    # For now, we run it if data is present, consistent with "Run Forced Labour Screening" toggle logic handled by frontend sending data.
    supplier = data.get('supplier', '')
    commodity = data.get('commodity', '') # Description acts as commodity often
    origin = data.get('origin', '')
    region = data.get('region', '')
    
    uflpa_outcome = screen_forced_labour(supplier, commodity, origin, region)
    
    # 3. DPS (Experimental/Future)
    # ----------------------------
    dps_outcome = None
    end_user_name = data.get('endUserName')
    if end_user_name:
        dps_outcome = screen_party(end_user_name)

    # 4. Audit Log
    # ------------
    log_audit_event('evaluation', {
        'eccn': eccn, 
        'destination': destination,
        'supplier': supplier,
        'risk_factors': uflpa_outcome['risk_level']
    })

    # 5. AI Insight (Consolidated)
    # ----------------------------
    ai_insight = "AI Insights unavailable."
    if model:
        try:
            prompt = (
                f"Act as an Export Compliance Specialist.\n"
                f"Review this shipment:\n"
                f"1. License Check: {license_outcome['status']}. ECCN {eccn} to {destination}. Exceptions: {[r['code'] for r in license_outcome['results'] if r['type']=='EXCEPTION']}\n"
                f"2. Forced Labor Check: {uflpa_outcome['risk_level']}. Supplier: {supplier}. Commodity: {commodity}.\n\n"
                f"Provide 2 concise paragraphs:\n"
                f"- License View: Summary of license requirements/exceptions.\n"
                f"- Supply Chain View: Summary of UFLPA risks and recommended due diligence."
            )
            response = model.generate_content(prompt)
            ai_insight = response.text.strip()
        except Exception as e:
            print(f"Gemini Error: {e}")

    return jsonify({
        "license_results": license_outcome,
        "uflpa_results": uflpa_outcome,
        "dps_results": dps_outcome,
        "ai_insight": ai_insight
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Multi-turn chat endpoint for agentic experience."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get('session_id') or str(uuid.uuid4())
    user_message = data.get('message', '')
    form_context = data.get('context', {})
    
    # Update context if form data provided
    if form_context:
        # This function is no longer imported, assuming it's handled by get_chat_response or removed.
        # For now, commenting out or adapting based on new chat_agent.
        # update_context(session_id, form_context)
        pass # Placeholder for context handling if needed by new chat_agent
    
    # Add user message to history
    add_message(session_id, 'user', user_message)
    
    # Get compliance results if context has ECCN
    compliance_results = None
    if form_context.get('eccn'):
        # This logic needs to be updated to use the new evaluate function structure
        # For now, keeping it simple or assuming get_chat_response handles it.
        # compliance_results, _ = evaluate_export(form_context)
        pass
    
    # Generate AI response
    ai_response = "I'm here to help with export compliance. What would you like to know?"
    if model:
        try:
            # Assuming get_chat_response now handles building prompt and context
            ai_response = get_chat_response(session_id, user_message, form_context)
        except Exception as e:
            print(f"Gemini Chat Error: {e}")
            ai_response = "I'm having trouble connecting right now. Please try again."
    
    # Add AI response to history
    add_message(session_id, 'assistant', ai_response)
    
    # Log to audit
    log_audit_event('chat', {'message': user_message, 'context': form_context}, ai_response)
    
    return jsonify({
        "session_id": session_id,
        "response": ai_response
    })

@app.route('/report', methods=['POST'])
def generate_report():
    """Generate a downloadable compliance report (JSON, Text, or PDF)."""
    
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Run evaluation (using the new evaluate logic)
    evaluation_response = evaluate().json # Call the evaluate endpoint internally
    
    results = evaluation_response.get('license_results', {})
    uflpa_results = evaluation_response.get('uflpa_results', {})
    dps_results = evaluation_response.get('dps_results', {})
    ai_suggestion = evaluation_response.get('ai_insight', "No AI recommendation available.")
    
    # Generate report
    report_data = generate_report_data(data, results, uflpa_results, dps_results, ai_suggestion)
    report_format = data.get('format', 'json')
    
    if report_format == 'pdf':
        pdf_bytes = generate_pdf_report(report_data)
        return pdf_bytes, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=compliance-report-{report_data["report_id"]}.pdf'
        }
    elif report_format == 'text':
        return format_report_as_text(report_data), 200, {'Content-Type': 'text/plain'}
    else:
        return jsonify(report_data)

@app.route('/audit', methods=['GET'])
def get_audit():
    """Get the audit log."""
    limit = request.args.get('limit', 50, type=int)
    return jsonify({"audit_log": get_audit_log(limit)})


@app.route('/screen-dps', methods=['POST'])
def screen_dps():
    """Screen a party against denied party lists."""
    data = request.json
    company_name = data.get('companyName', '')
    
    result = screen_party(company_name)
    
    # Log this screening event
    log_audit_event('DPS_SCREEN', {
        'company': company_name,
        'result': result['status'],
        'details': result
    })
    
    return jsonify(result)

@app.route('/screen-uflpa', methods=['POST'])
def screen_uflpa_endpoint():
    """Screen for UFLPA forced labor risks."""
    data = request.json
    supplier = data.get('supplier', '')
    commodity = data.get('commodity', '') # e.g., Cotton, Solar
    origin = data.get('origin', '') # Country of Origin
    
    result = screen_uflpa(supplier, commodity, origin)
    
    # Log this screening event
    log_audit_event('UFLPA_SCREEN', {
        'supplier': supplier,
        'risk': result['risk_level'],
        'details': result
    })
    
    return jsonify(result)

@app.route('/email-status', methods=['GET'])
def email_status():
    """Check email service configuration status."""
    from email_service import email_service
    return jsonify(email_service.get_status())

@app.route('/send-email', methods=['POST'])
def send_email():
    """Send compliance report via email."""
    from email_service import email_service, generate_compliance_email_html
    from export_utils import generate_report_data, generate_pdf_report
    
    data = request.json
    to_email = data.get('email')
    
    if not to_email:
        return jsonify({'success': False, 'error': 'Email address required'}), 400
    
    # 1. License Engine
    eccn = data.get('eccn', '')
    destination = data.get('destination', '')
    value = float(data.get('value', 0))
    end_user_type = data.get('endUserType', 'Commercial')
    
    license_results = run_license_exception_engine(eccn, destination, value, end_user_type)

    # 2. UFLPA Engine
    supplier = data.get('supplier', '')
    commodity = data.get('commodity', '') # Description
    origin = data.get('origin', '')
    region = data.get('region', '')
    
    uflpa_results = screen_forced_labour(supplier, commodity, origin, region)
    
    # 3. DPS (Mock)
    dps_results = None
    if data.get('endUserName'):
         dps_results = screen_party(data.get('endUserName'))

    # AI Insight
    ai_suggestion = ""
    if GOOGLE_API_KEY and model:
        try:
             prompt = f"Summarize compliance for ECCN {eccn} to {destination} in 2 sentences."
             response = model.generate_content(prompt)
             ai_suggestion = response.text.strip()
        except Exception:
             pass

    # Generate Report
    report_data = generate_report_data(data, license_results, uflpa_results, dps_results, ai_suggestion)
    
    # Generate email HTML
    html_content = generate_compliance_email_html(report_data)
    
    # Generate PDF attachment
    attachments = []
    if data.get('includePdf', True):
        try:
            pdf_bytes = generate_pdf_report(report_data)
            attachments.append({
                'filename': f'compliance-report-{report_data["report_id"]}.pdf',
                'content': pdf_bytes,
                'type': 'application/pdf'
            })
        except Exception as e:
            print(f"PDF generation error: {e}")
    
    # Send email
    result = email_service.send_email(
        to_email=to_email,
        subject=f'Export Compliance Report - {eccn} to {destination}',
        html_content=html_content,
        attachments=attachments if attachments else None
    )
    
    # Log the email send attempt
    log_audit_event('email_send', {
        'to': to_email,
        'eccn': eccn,
        'destination': destination,
        'success': result.get('success', False)
    })
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)

