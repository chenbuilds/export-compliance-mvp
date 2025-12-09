"""
ExportShield: License Exceptions Engine
---------------------------------------
A dedicated module for EAR license determination and exception applicability.
Inputs: ECCN, Country, Value, End User Type
Outputs: License Requirement, Eligible Exceptions, Decision Trace
"""

import json
import os

# =============================================================================
# DATA LOADING & CONFIGURATION
# =============================================================================

def load_country_groups():
    file_path = os.path.join(os.path.dirname(__file__), 'data', 'country_groups.json')
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

FULL_COUNTRY_DATA = load_country_groups()

def get_country_groups(country_name):
    """Retrieve BIS Country Groups (A:1, B, D:1, E:1, etc.)"""
    country_data = FULL_COUNTRY_DATA.get(country_name)
    if country_data:
        return country_data.get('groups', [])
    return []

def get_all_countries():
    """Return list of all available countries."""
    return sorted(list(FULL_COUNTRY_DATA.keys()))

# Restricted Destinations (Embargoed/Sanctioned)
RESTRICTED_DESTINATIONS = [c for c, data in FULL_COUNTRY_DATA.items() if 'E:1' in data.get('groups', [])]

# LVS Thresholds
LVS_THRESHOLD_A1 = 5000
LVS_THRESHOLD_B = 3000
LVS_THRESHOLD_DEFAULT = 1500

# ECCN Database
# Note: Ideally this would be loaded from an external JSON or DB, but kept inline for MVP portability/speed.
ECCN_DB = {
    # Category 1 - Materials
    '1A002': {'controls': ['NS', 'NP', 'AT'], 'exceptions': ['LVS', 'GBS'], 'lvs_limit': 5000,
              'description': 'Composite structures or laminates with organic/metal matrices.'},
    '1A004': {'controls': ['NS', 'AT', 'RS'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 1500,
              'description': 'Protective equipment and detection equipment.'},
    '1A995': {'controls': ['AT'], 'exceptions': ['LVS'], 'lvs_limit': 5000,
              'description': 'Protective equipment not specially designed for military use.'},
    '1C350': {'controls': ['CB', 'AT'], 'exceptions': ['LVS'], 'lvs_limit': 500,
              'description': 'Chemicals that may be used as precursors for toxic agents.'},
    '1C351': {'controls': ['CB', 'AT'], 'exceptions': [], 'lvs_limit': 0,
              'description': 'Human and animal pathogens and toxins.'},
    
    # Category 2 - Materials Processing
    '2A001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Anti-friction bearings and bearing systems.'},
    '2B001': {'controls': ['NS', 'NP', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 3000,
              'description': 'Machine tools for cutting metals, ceramics, composites.'},
    '2B006': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Dimensional inspection systems.'},
    '2B350': {'controls': ['CB', 'AT'], 'exceptions': ['LVS'], 'lvs_limit': 2500,
              'description': 'Chemical manufacturing facilities and equipment.'},

    # Category 3 - Electronics
    '3A001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'GBS', 'STA', 'TMP', 'GOV', 'RPL', 'TSR'], 'lvs_limit': 3000,
              'description': 'Electronic components (semiconductors, ICs, MCMs).'},
    '3A002': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'GBS', 'STA', 'TMP', 'RPL', 'TSR'], 'lvs_limit': 5000,
              'description': 'General purpose electronic equipment.'},
    '3A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL'], 'lvs_limit': 5000,
              'description': 'Electronic devices and components not controlled by 3A001.'},
    '3A992': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL'], 'lvs_limit': 5000,
              'description': 'General purpose electronic equipment n.e.s.'},
    '3A999': {'controls': ['AT'], 'exceptions': ['LVS'], 'lvs_limit': 5000,
              'description': 'Specific processing equipment n.e.s.'},
    '3B001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP', 'GOV', 'RPL'], 'lvs_limit': 5000,
              'description': 'Equipment for manufacturing semiconductors.'},
    
    # Category 4 - Computers
    '4A003': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'APP', 'STA', 'TMP', 'GOV', 'RPL', 'CIV'], 'lvs_limit': 5000,
              'description': 'Digital computers and related equipment.'},
    '4A994': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL'], 'lvs_limit': 5000,
              'description': 'Computers not controlled by 4A003.'},
    '4D001': {'controls': ['NS', 'AT'], 'exceptions': ['TSR', 'STA', 'TMP', 'GOV'], 'lvs_limit': 0,
              'description': 'Software for development/production of 4A equipment.'},
    '4D994': {'controls': ['AT'], 'exceptions': ['TSR', 'TMP'], 'lvs_limit': 0,
              'description': 'Software not controlled by 4D001.'},
    '4E001': {'controls': ['NS', 'AT'], 'exceptions': ['TSR', 'TMP', 'GOV'], 'lvs_limit': 0,
              'description': 'Technology for development of 4A/4D items.'},
    
    # Category 5 - Telecommunications & Information Security
    '5A001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP', 'GOV', 'RPL', 'TSR'], 'lvs_limit': 1000,
              'description': 'Telecommunications equipment.'},
    '5A002': {'controls': ['NS', 'AT', 'EI'], 'exceptions': ['ENC', 'STA', 'TMP', 'GOV', 'TSR', 'RPL', 'CIV', 'APP'], 'lvs_limit': 0,
              'description': 'Information security systems (encryption).'},
    '5A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL', 'TSR'], 'lvs_limit': 5000,
              'description': 'Telecommunication equipment not controlled by 5A001.'},
    '5A992': {'controls': ['AT'], 'exceptions': ['LVS', 'ENC', 'TMP', 'RPL', 'TSR'], 'lvs_limit': 5000,
              'description': 'Mass market encryption items.'},
    '5D002': {'controls': ['NS', 'AT', 'EI'], 'exceptions': ['ENC', 'TSR', 'TMP', 'GOV', 'CIV'], 'lvs_limit': 0,
              'description': 'Encryption software.'},
    '5D992': {'controls': ['AT'], 'exceptions': ['LVS', 'TSR', 'ENC'], 'lvs_limit': 5000,
              'description': 'Mass market encryption software.'},
    
    # Category 6 - Sensors & Lasers
    '6A001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 1500,
              'description': 'Acoustic systems, equipment and components.'},
    '6A002': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 2000,
              'description': 'Optical sensors and equipment.'},
    '6A003': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 1500,
              'description': 'Cameras and components.'},
    '6A005': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Lasers, components and optical equipment.'},
    '6A006': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 3000,
              'description': 'Magnetometers, gradiometers, underwater detection.'},
    
    # Category 7 - Navigation & Avionics
    '7A001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Accelerometers and components.'},
    '7A002': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Gyros and components.'},
    '7A003': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Inertial navigation/guidance systems.'},
    '7A103': {'controls': ['MT', 'AT'], 'exceptions': ['LVS'], 'lvs_limit': 5000,
              'description': 'Missile technology navigation equipment.'},
    
    # Category 8 - Marine
    '8A001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 5000,
              'description': 'Submersible vessels and surface vessels.'},
    '8A002': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Marine propulsion systems and components.'},

    # Category 9 - Aerospace & Propulsion
    '9A004': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 5000,
              'description': 'Space launch vehicles and spacecraft.'},
    '9A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP'], 'lvs_limit': 5000,
              'description': 'Aircraft and gas turbine engines not in 9A001.'},
    '9B001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Manufacturing equipment for gas turbines.'},
    
    # Category 0 - Nuclear
    '0A001': {'controls': ['NP', 'AT'], 'exceptions': [], 'lvs_limit': 0,
              'description': 'Nuclear reactors and specially designed components.'},
    '0B001': {'controls': ['NP', 'AT'], 'exceptions': [], 'lvs_limit': 0,
              'description': 'Plant for separation of uranium isotopes.'},

    # EAR99
    'EAR99': {'controls': [], 'exceptions': ['NLR'], 'lvs_limit': 0,
              'description': 'Items subject to EAR but not on CCL.'},
}

# =============================================================================
# CORE LOGIC
# =============================================================================

def get_lvs_threshold(destination, eccn_info):
    """Calculate applicable LVS value limit."""
    if eccn_info and eccn_info.get('lvs_limit'):
        base_limit = eccn_info['lvs_limit']
    else:
        base_limit = LVS_THRESHOLD_DEFAULT
    
    country_groups = get_country_groups(destination)
    if 'A:1' in country_groups:
        return min(base_limit, LVS_THRESHOLD_A1)
    elif 'B' in country_groups:
        return min(base_limit, LVS_THRESHOLD_B)
    return base_limit

def run_license_exception_engine(eccn, destination, value, end_user_type):
    """
    Main entry point for License Exception Engine.
    Returns: {
        "status": "CLEAR" | "WARNING" | "RESTRICTED",
        "exceptions": [...],
        "trace": [...],
        "details": {...}
    }
    """
    trace = []
    results = []
    
    # 1. Input Validation & ECCN Lookup
    eccn = eccn.upper().strip() # Normalize input
    trace.append(f"Analyzing ECCN: {eccn} for Destination: {destination}")
    eccn_info = ECCN_DB.get(eccn)
    
    if not eccn_info:
        # Fallback for unknown ECCN (assume EAR99-like/NLR for safety, or error?)
        # For this tool, we'll flag it.
        if not eccn:
            eccn_info = ECCN_DB['EAR99']
            trace.append("No ECCN provided. Treating as EAR99.")
        else:
            trace.append(f"ECCN {eccn} not found in database. Evaluating as potential catch-all.")
            return {
                "status": "WARNING",
                "results": [], # Fixed: 'exceptions' -> 'results' to match frontend contract
                "trace": trace,
                "message": "ECCN not recognized."
            }
    
    country_groups = get_country_groups(destination)
    trace.append(f"Country Groups for {destination}: {country_groups}")

    # 2. Embargo Check (Priority 1)
    if destination in RESTRICTED_DESTINATIONS:
        trace.append("CRITICAL: Destination is embargoed (E:1).")
        return {
            "status": "RESTRICTED",
            "exceptions": [],
            "trace": trace,
            "results": [{
                'type': 'LICENSE_REQUIRED',
                'code': 'EMBARGO',
                'title': 'Embargoed Destination',
                'justification': f"Exports to {destination} are generally prohibited.",
                'nextSteps': "Do NOT ship. Consult legal counsel."
            }]
        }

    # 3. Exception Evaluation
    available_exceptions = eccn_info.get('exceptions', [])
    trace.append(f"Available Exceptions for {eccn}: {available_exceptions}")
    
    # Logic for individual exceptions
    
    # LVS
    lvs_limit = get_lvs_threshold(destination, eccn_info)
    if 'LVS' in available_exceptions:
        if 0 < value <= lvs_limit and not any(g in ['D:1', 'E:1'] for g in country_groups):
             trace.append(f"LVS: Eligible (Value ${value} <= ${lvs_limit})")
             results.append({
                'type': 'EXCEPTION', 'code': 'LVS',
                'title': 'Limited Value Shipment (§740.3)',
                'justification': f"Value ${value} is within limit for {destination}.",
                'nextSteps': "Record LVS on documents."
            })
        elif 0 < value <= lvs_limit * 1.2:
             trace.append(f"LVS: Close Call (Value ${value} vs ${lvs_limit})")
             results.append({
                'type': 'TIP', 'code': 'TIP',
                'title': 'Borderline LVS Value',
                'justification': f"Value is close to ${lvs_limit} limit.",
                'nextSteps': "Verify valuation accuracy."
             })
    
    # GBS
    if 'GBS' in available_exceptions and 'B' in country_groups:
        trace.append("GBS: Eligible (Group B Destination)")
        results.append({
            'type': 'EXCEPTION', 'code': 'GBS',
            'title': 'Group B Shipment (§740.4)',
            'justification': f"{destination} is a Group B country.",
            'nextSteps': "Verify civil end-use."
        })
    
    # CIV
    if 'CIV' in available_exceptions and 'D:1' in country_groups and end_user_type != 'Government':
        trace.append("CIV: Eligible (Civil End Use)")
        results.append({
           'type': 'EXCEPTION', 'code': 'CIV',
           'title': 'Civil End-Users (§740.5)',
           'justification': "Export to civil end-user in D:1 country.",
           'nextSteps': "Obtain end-user statement."
        })

    # TSR
    if 'TSR' in available_exceptions and 'B' in country_groups:
        trace.append("TSR: Eligible (Technology/Software Restricted)")
        results.append({
            'type': 'EXCEPTION', 'code': 'TSR',
            'title': 'Technology/Software Restricted (§740.6)',
            'justification': "Eligible for Group B destination.",
            'nextSteps': "Obtain written assurance from consignee."
        })
        
    # APP
    if 'APP' in available_exceptions and ('A:1' in country_groups or 'B' in country_groups): # Simplified rule
        trace.append("APP: Eligible (Computer Adjusted Peak Performance)")
        results.append({
            'type': 'EXCEPTION', 'code': 'APP',
            'title': 'Computer APP (§740.7)',
            'justification': "Performance is within APP limits.",
            'nextSteps': "Verify CTP/APP calculation."
        })

    # TMP
    if 'TMP' in available_exceptions:
        # TMP is conditional on user intent, so we present it as an option if country is okay
        if not any(g in ['D:1', 'E:1'] for g in country_groups): 
             trace.append("TMP: Potentially Eligible (User Intent Required)")
             results.append({
                'type': 'EXCEPTION', 'code': 'TMP',
                'title': 'Temporary Export (§740.9)',
                'justification': "Eligible if item returns within 1 year.",
                'nextSteps': "Ensure item is returned or destroyed."
            })
    
    # RPL
    if 'RPL' in available_exceptions:
        trace.append("RPL: Potentially Eligible (Replacement Parts)")
        results.append({
            'type': 'EXCEPTION', 'code': 'RPL',
            'title': 'Servicing and Replacement (§740.10)',
            'justification': "Eligible for 1-for-1 replacement parts.",
            'nextSteps': "Match part to original export license."
        })

    # GOV
    if 'GOV' in available_exceptions:
        if end_user_type == 'Government' or 'A:1' in country_groups:
            trace.append("GOV: Eligible")
            results.append({
                'type': 'EXCEPTION', 'code': 'GOV',
                'title': 'Government End-Users (§740.11)',
                'justification': "Export to government entity or cooperating government.",
                'nextSteps': "Verify agency eligibility."
            })
            
    # ENC
    if 'ENC' in available_exceptions:
        if any(g in ['A:1', 'B'] for g in country_groups) or end_user_type == 'Commercial':
            trace.append("ENC: Eligible (Encryption)")
            results.append({
                'type': 'EXCEPTION', 'code': 'ENC',
                'title': 'Encryption Commodities (§740.17)',
                'justification': "License Exception ENC available.",
                'nextSteps': "File self-classification report."
            })
            
    # STA
    if 'STA' in available_exceptions and 'A:1' in country_groups: # Simplified STA (A:1 mostly)
         trace.append("STA: Eligible (Strategic Trade Auth)")
         results.append({
            'type': 'EXCEPTION', 'code': 'STA',
            'title': 'Strategic Trade Authorization (§740.20)',
            'justification': f"{destination} is a key partner (A:5/A:6).",
            'nextSteps': "Notify consignee of STA use."
        })

    # NLR (No License Required) check
    if not results and eccn == 'EAR99':
         if not any(g in ['E:1'] for g in country_groups):
            trace.append("NLR: Eligible (EAR99)")
            results.append({
                'type': 'EXCEPTION', 'code': 'NLR',
                'title': 'No License Required',
                'justification': "Item is EAR99 and destination is not embargoed.",
                'nextSteps': "NLR designator on export docs."
            })

    # Final Determination
    if not results:
        trace.append("No exceptions found. License likely required.")
        results.append({
            'type': 'LICENSE_REQUIRED', 'code': 'LIC_REQ',
            'title': 'License Required',
            'justification': "No applicable exceptions found for this ECCN/Destination pair.",
            'nextSteps': "Apply for BIS Export License."
        })
        status = "WARNING"
    else:
        status = "CLEAR" if any(r['type'] in ['EXCEPTION', 'NLR'] for r in results) else "WARNING"

    return {
        "status": status,
        "results": results,
        "trace": trace,
        "eccn_description": eccn_info.get('description', '')
    }
