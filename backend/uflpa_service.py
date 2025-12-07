
"""
UFLPA Screening Service (Mock)
Simulates checking against the UFLPA Entity List and high-risk regions.
"""

# Mock High Risk Entities (UFLPA Entity List)
MOCK_UFLPA_ENTITIES = {
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
    }
}

# Mock High Risk Commodities
HIGH_RISK_COMMODITIES = ["COTTON", "TOMATO", "POLYSILICON", "SILICA", "SOLAR", "APPAREL", "TEXTILE"]

def screen_uflpa(supplier_name, commodity, origin_country):
    """
    Screens for Forced Labor risks based on supplier, commodity, and origin.
    Returns: { risk_level: 'LOW'|'MEDIUM'|'HIGH', details: {...} }
    """
    if not supplier_name and not commodity:
        return {"risk_level": "LOW", "messages": ["Insufficient data for screening."]}

    score = 0
    reasons = []

    # 1. Supplier Check (Direct Match)
    supplier_upper = supplier_name.upper() if supplier_name else ""
    for entity, info in MOCK_UFLPA_ENTITIES.items():
        if entity in supplier_upper:
            return {
                "risk_level": "HIGH",
                "match_name": entity,
                "reason": info["reason"],
                "category": info["category"],
                "action": "Rebuttable Presumption of Forced Labor applies. Import prohibited unless proven otherwise via clear and convincing evidence."
            }

    # 2. Commodity Check
    commodity_upper = commodity.upper() if commodity else ""
    for risk_item in HIGH_RISK_COMMODITIES:
        if risk_item in commodity_upper:
            score += 2
            reasons.append(f"High-risk commodity detected: {risk_item} (UFLPA Priority Sector)")
    
    # 3. Origin Check (Xinjiang / China)
    origin_upper = origin_country.upper() if origin_country else ""
    if "CHINA" in origin_upper:
        score += 1
        if score > 0: # Only flag China if commodity is also suspect
            reasons.append("Origin is China (High risk for UFLPA enforcement if supply chain touches XUAR)")

    # Determine Risk Level
    if score >= 3:
        return {
            "risk_level": "HIGH",
            "reason": "Combination of high-risk commodity and origin.",
            "details": reasons,
            "action": "Enhanced Due Diligence REQUIRED. Map supply chain to raw material level."
        }
    elif score >= 1:
        return {
            "risk_level": "MEDIUM",
            "reason": "Potential risk factors identificed.",
            "details": reasons,
            "action": "Verify supply chain does not involve XUAR entities."
        }
    
    return {
        "risk_level": "LOW",
        "reason": "No immediate UFLPA risk factors detected.",
        "action": "Standard due diligence."
    }
