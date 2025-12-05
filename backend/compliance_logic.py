
"""
Export Compliance Logic Engine
"""

# Country Groups (Simplified from EAR Supplement No. 1 to Part 740)
COUNTRY_GROUPS = {
    'A1': ['Australia', 'Austria', 'Belgium', 'Canada', 'Denmark', 'Finland', 'France', 
           'Germany', 'Greece', 'Ireland', 'Italy', 'Japan', 'Luxembourg', 'Netherlands',
           'New Zealand', 'Norway', 'Portugal', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'],
    'B': ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Hong Kong', 'India', 'Israel', 
          'Malaysia', 'Mexico', 'Philippines', 'Singapore', 'South Africa', 'South Korea',
          'Taiwan', 'Thailand', 'Turkey', 'United Arab Emirates', 'Vietnam'],
    'D1': ['China', 'Russia', 'Belarus', 'Venezuela'],  # NS Column concerns
    'E1': ['Cuba', 'Iran', 'North Korea', 'Syria'],  # Embargoed
}

# Expanded ECCN Database (40 Common ECCNs)
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
    
    # Category 3 - Electronics
    '3A001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'GBS', 'STA', 'TMP', 'GOV', 'RPL', 'TSR'], 'lvs_limit': 3000,
              'description': 'Electronic components (semiconductors, ICs, MCMs).'},
    '3A002': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'GBS', 'STA', 'TMP', 'RPL', 'TSR'], 'lvs_limit': 5000,
              'description': 'General purpose electronic equipment.'},
    '3A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL'], 'lvs_limit': 5000,
              'description': 'Electronic devices and components not controlled by 3A001.'},
    '3A992': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP', 'RPL'], 'lvs_limit': 5000,
              'description': 'General purpose electronic equipment n.e.s.'},
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
    
    # Category 9 - Aerospace & Propulsion
    '9A004': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 5000,
              'description': 'Space launch vehicles and spacecraft.'},
    '9A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP'], 'lvs_limit': 5000,
              'description': 'Aircraft and gas turbine engines not in 9A001.'},
    '9B001': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Manufacturing equipment for gas turbines.'},
    
    # Category 2 - Materials Processing (Additional)
    '2A001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Anti-friction bearings and bearing systems.'},
    '2B001': {'controls': ['NS', 'NP', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 3000,
              'description': 'Machine tools for cutting metals, ceramics, composites.'},
    '2B006': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Dimensional inspection systems.'},
    '2B350': {'controls': ['CB', 'AT'], 'exceptions': ['LVS'], 'lvs_limit': 2500,
              'description': 'Chemical manufacturing facilities and equipment.'},
    
    # Category 8 - Marine (Additional)
    '8A001': {'controls': ['NS', 'AT'], 'exceptions': ['LVS', 'STA', 'TMP'], 'lvs_limit': 5000,
              'description': 'Submersible vessels and surface vessels.'},
    '8A002': {'controls': ['NS', 'MT', 'AT'], 'exceptions': ['LVS', 'STA'], 'lvs_limit': 5000,
              'description': 'Marine propulsion systems and components.'},
    
    # Category 0 - Nuclear Materials (Additional)
    '0A001': {'controls': ['NP', 'AT'], 'exceptions': [], 'lvs_limit': 0,
              'description': 'Nuclear reactors and specially designed components.'},
    '0B001': {'controls': ['NP', 'AT'], 'exceptions': [], 'lvs_limit': 0,
              'description': 'Plant for separation of uranium isotopes.'},
    
    # High-Demand Additional ECCNs
    '3A999': {'controls': ['AT'], 'exceptions': ['LVS'], 'lvs_limit': 5000,
              'description': 'Specific processing equipment n.e.s.'},
    '5D992': {'controls': ['AT'], 'exceptions': ['LVS', 'TSR', 'ENC'], 'lvs_limit': 5000,
              'description': 'Mass market encryption software.'},
    
    # EAR99 - Not controlled
    'EAR99': {'controls': [], 'exceptions': ['NLR'], 'lvs_limit': 0,
              'description': 'Items subject to EAR but not on CCL.'},
}

# Restricted Destinations (Embargoed/Sanctioned)
RESTRICTED_DESTINATIONS = COUNTRY_GROUPS['E1']

# LVS Thresholds by Country Group
LVS_THRESHOLD_A1 = 5000
LVS_THRESHOLD_B = 3000
LVS_THRESHOLD_DEFAULT = 1500

# Comprehensive Exception Registry with Regulatory Citations
EXCEPTION_REGISTRY = {
    'LVS': {
        'name': 'Shipments of Limited Value',
        'section': '§740.3',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.3',
        'description': 'Exports of limited value may be made without a license.',
        'icon': 'file-text',
        'color': '#10b981',
        'requirements': ['Value within threshold', 'Not to D:1/E:1 countries', 'No order splitting'],
    },
    'TMP': {
        'name': 'Temporary Exports/Imports',
        'section': '§740.9',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.9',
        'description': 'Temporary export of items for exhibition, demonstration, or testing.',
        'icon': 'clock',
        'color': '#f59e0b',
        'requirements': ['Item must return within 1-4 years', 'Cannot be sold or transferred', 'Records required'],
    },
    'GOV': {
        'name': 'Government End-Users',
        'section': '§740.11',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.11',
        'description': 'Exports to U.S. government agencies or authorized foreign government end-users.',
        'icon': 'shield',
        'color': '#0891b2',
        'requirements': ['U.S. government agency', 'Foreign government with authorization', 'Supporting documentation'],
    },
    'STA': {
        'name': 'Strategic Trade Authorization',
        'section': '§740.20',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.20',
        'description': 'Strategic exports to STA-eligible destinations (36 countries).',
        'icon': 'globe',
        'color': '#3b82f6',
        'requirements': ['Destination must be STA eligible', 'ECCN must allow STA', 'Consignee statement required'],
    },
    'ENC': {
        'name': 'Encryption Commodities/Software',
        'section': '§740.17',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.17',
        'description': 'Export of encryption items after self-classification or review.',
        'icon': 'lock',
        'color': '#8b5cf6',
        'requirements': ['Self-classification report filed', 'Mass market or open source eligible', 'Semi-annual reporting'],
    },
    'GBS': {
        'name': 'Shipments to Group B Countries',
        'section': '§740.4',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.4',
        'description': 'Exports of NS-controlled items to Group B destinations.',
        'icon': 'globe',
        'color': '#10b981',
        'requirements': ['Country must be in Group B', 'Civil end-use only', 'No MT/NP reasons for control'],
    },
    'TSR': {
        'name': 'Technology and Software Restriction',
        'section': '§740.6',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.6',
        'description': 'Export of technology and software for installation/maintenance.',
        'icon': 'code',
        'color': '#6366f1',
        'requirements': ['Part of sale/lease agreement', 'For maintenance/repair', 'Authorized recipient'],
    },
    'RPL': {
        'name': 'Servicing and Replacement Parts',
        'section': '§740.10',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.10',
        'description': 'Export of one-for-one replacement parts and components.',
        'icon': 'settings',
        'color': '#64748b',
        'requirements': ['One-for-one replacement', 'Original export was authorized', 'Part is for originally exported item'],
    },
    'APP': {
        'name': 'Computers (Additional Permissive Reexports)',
        'section': '§740.7',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.7',
        'description': 'Export/reexport of computers based on APP parameters.',
        'icon': 'cpu',
        'color': '#06b6d4',
        'requirements': ['Computer performance within limits', 'Not for prohibited end-uses', 'APP parameters met'],
    },
    'NAC': {
        'name': 'National Security Controls - Eligible',
        'section': '§740.2(a)',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.2',
        'description': 'Items controlled for National Security reasons with exception eligibility.',
        'icon': 'shield-check',
        'color': '#22c55e',
        'requirements': ['NS control reason', 'Destination eligible', 'End-use restrictions observed'],
    },
    'CIV': {
        'name': 'Civil End-Users',
        'section': '§740.5',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.5',
        'description': 'Exports to civil end-users for civil end-uses.',
        'icon': 'building',
        'color': '#0ea5e9',
        'requirements': ['Civil end-user', 'Civil end-use only', 'Not for military'],
    },
    'BAG': {
        'name': 'Baggage (Personal Use)',
        'section': '§740.14',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.14',
        'description': 'Items carried as personal baggage for personal use.',
        'icon': 'briefcase',
        'color': '#a855f7',
        'requirements': ['Owned by individual', 'Accompanying traveler', 'For personal use only'],
    },
    'AVS': {
        'name': 'Aircraft, Vessels, Spacecraft',
        'section': '§740.15',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.15',
        'description': 'Items for aircraft, vessel, or spacecraft departing U.S.',
        'icon': 'plane',
        'color': '#ec4899',
        'requirements': ['For use on vessel/aircraft', 'Departure from U.S.', 'Necessary for operation'],
    },
    'NLR': {
        'name': 'No License Required',
        'section': 'EAR99',
        'ecfr_url': 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-734',
        'description': 'Item is EAR99 or otherwise does not require a license.',
        'icon': 'check-circle',
        'color': '#22c55e',
        'requirements': ['EAR99 classification', 'No prohibited end-use', 'No denied parties'],
    },
}

def get_lvs_threshold(destination, eccn_info):
    """Get LVS threshold based on destination and ECCN."""
    if eccn_info and eccn_info.get('lvs_limit'):
        base_limit = eccn_info['lvs_limit']
    else:
        base_limit = LVS_THRESHOLD_DEFAULT
    
    if destination in COUNTRY_GROUPS['A1']:
        return min(base_limit, LVS_THRESHOLD_A1)
    elif destination in COUNTRY_GROUPS['B']:
        return min(base_limit, LVS_THRESHOLD_B)
    return base_limit

def get_country_group(destination):
    """Determine country group for a destination."""
    for group, countries in COUNTRY_GROUPS.items():
        if destination in countries:
            return group
    return 'OTHER'

def validate_eccn(eccn):
    """
    Validates and classifies the ECCN.
    Returns: (eccn_info, trace_step)
    """
    if not eccn:
        return None, "Conclusion: No ECCN provided. Defaulted to EAR99."
    
    eccn_info = ECCN_DB.get(eccn)
    if eccn_info:
        return eccn_info, f"Identified ECCN {eccn}: ({', '.join(eccn_info['controls'])}) -- {eccn_info['description']}"
    else:
        return None, f"ECCN {eccn} not found in database. Assuming NLR."

def check_embargo(destination):
    """
    Checks if the destination is embargoed.
    Returns: (is_embargoed, trace_step, embargo_result)
    """
    if destination in RESTRICTED_DESTINATIONS:
        result = {
            'type': 'LICENSE_REQUIRED',
            'code': 'EMBARGO',
            'title': 'License Required / Embargoed',
            'justification': f"Export to {destination} is heavily restricted.",
            'caveats': ["Most exports will be denied.", "Consult legal counsel."],
            'nextSteps': "Do not ship without explicit authorization."
        }
        return True, "CRITICAL: Embargoed destination detected.", result
    return False, "Destination is eligible for trade (with conditions).", None

def evaluate_exceptions(eccn, eccn_info, value, destination, end_user_type, is_gov_contract, is_temporary=False):
    """
    Evaluates applicable exceptions (LVS, GOV, STA, TMP, GBS, ENC) and proactive tips.
    Returns: (results_list, trace_steps_list)
    """
    results = []
    trace_steps = []
    
    country_group = get_country_group(destination)
    lvs_threshold = get_lvs_threshold(destination, eccn_info)
    available_exceptions = eccn_info.get('exceptions', []) if eccn_info else []
    
    trace_steps.append(f"Evaluating exceptions for Value: ${value}, End User: {end_user_type}, Country Group: {country_group}")

    # Proactive Tip: Borderline Value Check
    if eccn_info and 'LVS' in available_exceptions:
        if lvs_threshold < value <= lvs_threshold * 1.2:
             trace_steps.append(f"PROACTIVE TIP: Value ${value} is close to LVS limit (${lvs_threshold} for {country_group}).")
             results.append({
                'type': 'TIP',
                'code': 'TIP',
                'title': 'Proactive Insight: Borderline Value',
                'justification': f"The declared value (${value}) is slightly above the LVS threshold (${lvs_threshold}) for {destination}.",
                'caveats': ["Consider if any non-essential items can be shipped separately to qualify.", "Ensure valuation is accurate."],
                'nextSteps': "Review invoice value."
             })

    # LVS - Shipments of Limited Value
    if eccn_info and 'LVS' in available_exceptions:
        if 0 < value <= lvs_threshold and country_group not in ['D1', 'E1']:
             trace_steps.append(f"LVS Applicable: Value ${value} <= Threshold ${lvs_threshold}.")
             results.append({
                'type': 'EXCEPTION',
                'code': 'LVS',
                'title': 'Shipment of Limited Value (§740.3)',
                'justification': f"The item is eligible for LVS exception because the declared value (${value}) is within the threshold (${lvs_threshold}) for this ECCN and destination.",
                'caveats': ["Cannot split orders to meet the threshold.", "Not applicable to D:1 country group.", "Recordkeeping required."],
                'nextSteps': "Record 'LVS' on shipping documents (AES/EEI)."
            })
        elif value > lvs_threshold:
             trace_steps.append(f"LVS Not Applicable: Value ${value} exceeds threshold ${lvs_threshold}.")

    # TMP - Temporary Exports
    if eccn_info and 'TMP' in available_exceptions and is_temporary:
        if country_group in ['A1', 'B']:
            trace_steps.append("TMP Applicable: Temporary export/re-export eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'TMP',
                'title': 'Temporary Imports/Exports (§740.9)',
                'justification': f"Temporary export of {eccn} to {destination} for repair, exhibition, or testing.",
                'caveats': ["Must remain abroad no more than 12 months.", "Must be returned to the U.S.", "Not for sale or transfer."],
                'nextSteps': "Document return timeline and maintain records."
            })

    # GBS - Group B Shipments
    if eccn_info and 'GBS' in available_exceptions:
        if country_group == 'B' and value > 0:
            trace_steps.append("GBS Applicable: Group B country shipment eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'GBS',
                'title': 'Shipments to Group B (§740.4)',
                'justification': f"Export of {eccn} to {destination} (Group B) qualifies for GBS.",
                'caveats': ["Only for commodities without NS Column 2 controls.", "Consignee screening required."],
                'nextSteps': "Verify consignee is not on denied parties list."
            })

    # ENC - Encryption Exception
    if eccn_info and 'ENC' in available_exceptions:
        if country_group in ['A1', 'B']:
            trace_steps.append("ENC Applicable: Encryption exception eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'ENC',
                'title': 'Encryption (§740.17)',
                'justification': f"Encryption items under {eccn} may qualify for ENC exception.",
                'caveats': ["May require classification request to BIS.", "Self-classification for mass market (§740.17(b)).", "Annual self-classification report may be required."],
                'nextSteps': "Submit encryption classification or complete self-classification."
            })

    # GOV - Government End-Users
    if end_user_type == 'Government' or is_gov_contract:
        if country_group in ['A1', 'B']:
            trace_steps.append("GOV Applicable: Government End User detected.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'GOV',
                'title': 'Government End-Users (§740.11)',
                'justification': f"The end user is a government entity in {destination}. GOV exception applies to exports to cooperating governments.",
                'caveats': ["Ensure the agency is eligible (check §740.11(b)).", "Consignee must be the government agency.", "Not available for all ECCNs."],
                'nextSteps': "Verify agency eligibility in EAR Part 740.11(b)."
            })

    # STA - Strategic Trade Authorization
    if eccn_info and 'STA' in available_exceptions:
        if country_group == 'A1':
            trace_steps.append("STA Applicable: Strategic Trade Authorization eligible destination.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'STA',
                'title': 'Strategic Trade Authorization (§740.20)',
                'justification': f"Exports of {eccn} to {destination} (Group A:1) are eligible for STA.",
                'caveats': ["Requires Prior Consignee Statement.", "Notification to BIS within 30 days.", "Must meet STA eligibility criteria."],
                'nextSteps': "Obtain signed Prior Consignee Statement before shipping."
            })
    
    # TSR - Technology and Software Restriction
    if eccn_info and 'TSR' in available_exceptions:
        if country_group in ['A1', 'B']:
            trace_steps.append("TSR Applicable: Technology/Software for operation/maintenance eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'TSR',
                'title': 'Technology and Software (§740.6)',
                'justification': f"Technology/software for {eccn} for installation, operation, or maintenance qualifies for TSR.",
                'caveats': ["Only for operation/maintenance of legally exported equipment.", "Cannot be used for production.", "Records required."],
                'nextSteps': "Document the relationship to previously exported equipment."
            })
    
    # RPL - Servicing and Replacement Parts
    if eccn_info and 'RPL' in available_exceptions:
        if country_group in ['A1', 'B']:
            trace_steps.append("RPL Applicable: Replacement parts exception eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'RPL',
                'title': 'Replacement Parts (§740.10)',
                'justification': f"One-for-one replacement parts for {eccn} qualify for RPL exception.",
                'caveats': ["Must be one-for-one replacement.", "Original export must have been authorized.", "Part must be for originally exported item."],
                'nextSteps': "Document the defective part being replaced."
            })
    
    # APP - Computers (Additional Permissive Reexports)
    if eccn_info and 'APP' in available_exceptions:
        if country_group in ['A1', 'B']:
            trace_steps.append("APP Applicable: Computer/APP parameters met.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'APP',
                'title': 'Computers - APP (§740.7)',
                'justification': f"Computer-related items under {eccn} may qualify for APP based on performance parameters.",
                'caveats': ["Computer performance must be within APP limits.", "Not for prohibited end-uses (military, WMD).", "Verify APP eligibility."],
                'nextSteps': "Verify computer performance is within APP thresholds."
            })
    
    # CIV - Civil End-Users
    if eccn_info and 'CIV' in available_exceptions:
        if country_group in ['A1', 'B'] and end_user_type != 'Military':
            trace_steps.append("CIV Applicable: Civil end-user exception eligible.")
            results.append({
                'type': 'EXCEPTION',
                'code': 'CIV',
                'title': 'Civil End-Users (§740.5)',
                'justification': f"Export of {eccn} to civil end-users in {destination} qualifies for CIV exception.",
                'caveats': ["End-user must be civilian.", "End-use must be civil.", "Not for military applications."],
                'nextSteps': "Obtain end-use statement confirming civil application."
            })
            
    return results, trace_steps

def evaluate_export(data):
    """
    Evaluates export compliance based on input data using modular logic.
    Returns a tuple: (results, trace)
    """
    results = []
    trace = []
    
    eccn = data.get('eccn', '').upper()
    destination = data.get('destination', '')
    end_user_type = data.get('endUserType', '')
    is_gov_contract = data.get('isGovernmentContract', False) or data.get('isGovernmentContract') == 'true'
    try:
        value = float(data.get('value', 0))
    except (ValueError, TypeError):
        value = 0

    # 1. Validation & Classification
    trace.append(f"Classifying product with ECCN: {eccn if eccn else 'None'}...")
    eccn_info, validation_trace = validate_eccn(eccn)
    trace.append(validation_trace)
    
    if not eccn:
        return [{
            'type': 'NLR',
            'code': 'EAR99',
            'title': 'No License Required (Likely)',
            'justification': "No ECCN provided. Assuming EAR99.",
            'caveats': ["If this item is specially designed for military use, it may be ITAR controlled."],
            'nextSteps': "Verify the item classification."
        }], trace

    # 2. Embargo Check
    trace.append(f"Checking restrictions for destination: {destination}...")
    is_embargoed, embargo_trace, embargo_result = check_embargo(destination)
    trace.append(embargo_trace)
    
    if is_embargoed:
        return [embargo_result], trace

    # 3. Exception Logic
    exception_results, exception_trace = evaluate_exceptions(eccn, eccn_info, value, destination, end_user_type, is_gov_contract)
    results.extend(exception_results)
    trace.extend(exception_trace)

    # Fallbacks
    if eccn_info and not any(r['type'] == 'EXCEPTION' for r in results):
         trace.append("No full exceptions found for Controlled Item.")
         results.append({
            'type': 'LICENSE_REQUIRED',
            'code': 'IVL',
            'title': 'Individual Validated License',
            'justification': f"Item is controlled ({', '.join(eccn_info['controls'])}) and no exemptions matched.",
            'caveats': ["Processing time can be 30-60 days.", "Check if 'AT' only controls apply (often NLR to friendly countries)."],
            'nextSteps': "Apply for a license in SNAP-R."
        })

    if not eccn_info and not results:
        results.append({
            'type': 'NLR',
            'code': 'NLR',
            'title': 'No License Required',
            'justification': f"ECCN '{eccn}' is not in our restricted database. Assuming it is not controlled for this destination.",
            'caveats': ["Verify ECCN is correct."],
            'nextSteps': "Proceed with shipment as NLR."
        })

    trace.append(f"Evaluation Complete. Found {len(results)} potential outcome(s).")
    return results, trace
