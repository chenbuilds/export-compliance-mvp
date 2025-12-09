"""
ExportShield: Forced Labour Screening Engine
---------------------------------------------
Dedicated module for UFLPA and forced labour risk analysis.
Inputs: Supplier, Commodity, Origin, Region
Outputs: Risk Level, Reason, Action, Detail
"""

# Mock High Risk Entities (UFLPA Entity List)
# In production, this would be a large database or API lookup
UFLPA_ENTITY_LIST = {
    "XINJIANG COTTON": {
        "status": "HIGH_RISK",
        "reason": "Listed on UFLPA Entity List",
        "category": "Priority Enforcement"
    },
    "HOSHINE SILICON": {
        "status": "HIGH_RISK",
        "reason": "Listed on UFLPA Entity List",
        "category": "Silica-based products"
    },
    "XPCC": {
        "status": "HIGH_RISK",
        "reason": "Listed on UFLPA Entity List",
        "category": "Cotton and Cotton Products"
    },
    "LUOZHOU": {
        "status": "HIGH_RISK",
        "reason": "Listed on UFLPA Entity List",
        "category": "Polysilicon"
    }
}

# High Risk Commodities (UFLPA Priority Sectors)
HIGH_RISK_COMMODITIES = ["COTTON", "TOMATO", "POLYSILICON", "SILICA", "SOLAR", "APPAREL", "TEXTILE", "PVC"]

def screen_forced_labour(supplier=None, commodity=None, origin=None, region=None):
    """
    Screens for Forced Labor risks based on supplier, commodity, and origin.
    Returns: { 
        risk_level: 'CLEAR'|'HIGH_RISK'|'SEIZURE_LIKELY', 
        reasons: [...], 
        action: "..." 
    }
    """
    
    # Defaults
    if not supplier: supplier = ""
    if not commodity: commodity = ""
    if not origin: origin = ""
    if not region: region = ""
    
    supplier_upper = supplier.strip().upper()
    commodity_upper = commodity.strip().upper()
    origin_upper = origin.strip().upper()
    region_upper = region.strip().upper()
    
    reasons = []
    risk_score = 0
    
    # 1. Entity Match (Direct UFLPA List Hit)
    # ---------------------------------------
    entity_match = False
    for entity, info in UFLPA_ENTITY_LIST.items():
        if entity in supplier_upper and supplier_upper:
            risk_score += 10 # Immediate Fail
            reasons.append(f"ENTITY MATCH: '{entity}' is on the UFLPA Entity List ({info['category']}).")
            entity_match = True
            break
            
    # 2. Region Match (Xinjiang / XUAR)
    # ---------------------------------
    region_match = False
    if "XINJIANG" in origin_upper or "XINJIANG" in region_upper or "XUAR" in region_upper:
        risk_score += 5
        reasons.append("REGION MATCH: Supply chain touches Xinjiang (XUAR). Rebuttable presumption applies.")
        region_match = True

    # 3. Commodity Risk
    # -----------------
    commodity_match = False
    for item in HIGH_RISK_COMMODITIES:
        if item in commodity_upper:
            commodity_match = True
            if "CHINA" in origin_upper:
                risk_score += 2
                reasons.append(f"COMMODITY RISK: '{item}' from China is a UFLPA priority enforcement sector.")
            else:
                risk_score += 1
                reasons.append(f"COMMODITY WARNING: '{item}' is a high-risk commodity sector.")
            break
            
    # Risk Determination
    # ------------------
    if risk_score >= 10 or (region_match and commodity_match):
        return {
            "risk_level": "SEIZURE_LIKELY",
            "matches": {
                "entity": entity_match,
                "region": region_match,
                "commodity": commodity_match
            },
            "reasons": reasons,
            "action": "IMPORT PROHIBITED. Rebuttable presumption applies. Clear and convincing evidence required."
        }
    elif risk_score >= 2:
        return {
            "risk_level": "HIGH_RISK",
            "matches": {
                "entity": entity_match,
                "region": region_match,
                "commodity": commodity_match
            },
            "reasons": reasons,
            "action": "Enhanced Due Diligence REQUIRED. Map supply chain to raw material level."
        }
    elif risk_score == 1:
        return {
            "risk_level": "WARNING",
            "matches": {
                "entity": entity_match,
                "region": region_match,
                "commodity": commodity_match
            },
            "reasons": reasons,
            "action": "Standard Due Diligence. Verify Country of Origin."
        }
    else:
        return {
            "risk_level": "CLEAR",
            "matches": {
                "entity": False,
                "region": False,
                "commodity": False
            },
            "reasons": ["No immediate UFLPA risk factors detected."],
            "action": "Proceed with standard import procedures."
        }
