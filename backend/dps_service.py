import random

"""
Denied Party Screening (DPS) Service (Mock)
Simulates checking against:
- BIS Entity List
- OFAC SDN List
- DDTC Debarred Parties
"""

# Mock Database of Denied Parties
MOCK_DENIED_PARTIES = {
    "HUAWEI": {
        "status": "BLOCKED",
        "list": "BIS Entity List",
        "reason": "Entity List - Presumption of Denial",
        "ref": "Supp. No. 4 to Part 744"
    },
    "ZTE": {
        "status": "POTENTIAL_MATCH",
        "list": "BIS Entity List",
        "reason": "Requires License Review",
        "ref": "Supp. No. 4 to Part 744"
    },
    "VENEZUELA DEFENSE": {
        "status": "BLOCKED",
        "list": "OFAC SDN",
        "reason": "Sanctioned Entity",
        "ref": "EO 13884"
    },
    "IRAN SHIPPING": {
        "status": "BLOCKED",
        "list": "OFAC SDN",
        "reason": "Specially Designated National",
        "ref": "EO 13599"
    },
    "KASPERSKY": {
        "status": "BLOCKED",
        "list": "BIS Entity List",
        "reason": "ICTS Prohibition",
        "ref": "Final Rule 2024"
    },
     "DJI": {
        "status": "POTENTIAL_MATCH",
        "list": "Chinese Military-Industrial Complex Companies List",
        "reason": "Investment Ban / Export Restrictions",
        "ref": "EO 14032"
    }
}

def screen_party(name):
    """
    Screens a single party name against mock watchlists.
    Returns: { status: 'CLEAR'|'MATCH'|'BLOCK', details: {...} }
    """
    if not name:
        return {"status": "CLEAR", "messages": []}

    search_term = name.upper().strip()
    
    # Direct Match Check
    for denied_name, info in MOCK_DENIED_PARTIES.items():
        if denied_name in search_term or search_term in denied_name:
            return {
                "status": info["status"],
                "match_name": denied_name,
                "list": info["list"],
                "reason": info["reason"],
                "reference": info["ref"]
            }
            
    # Random Fuzzy Match Simulation (for demo purposes only)
    # in prod this would use Levenshtein distance or dedicated search engine
    if "TECHNOLOGY" in search_term or "SYSTEMS" in search_term:
        # Simulate occasional false positives/reviews for generic tech company names
        # doing this just to show UI state for 'Potential Match'
        if random.random() > 0.8: 
             return {
                "status": "POTENTIAL_MATCH",
                "match_name": f"SIMILAR TO {search_term}",
                "list": "Unverified List",
                "reason": "Red Flag: Unable to verify bona fides",
                "reference": "Supp. No. 6 to Part 744"
            }

    return {"status": "CLEAR"}
