
/**
 * Mock Compliance Engine
 * Evaluates export scenarios against simplified EAR rules.
 */

// Mock Data
const ECCN_DB = {
    '1A995': {
        description: 'Protective and detection equipment not specifically designed for military use.',
        controls: ['AT'], // Anti-Terrorism
        exceptions: ['LVS']
    },
    '3A001': {
        description: 'Electronic components.',
        controls: ['NS', 'AT', 'RS'], // National Security, Anti-Terrorism, Regional Stability
        exceptions: ['LVS', 'GBS']
    }
    // Add more as needed
};

// Simplified Country Chart (True = Restricted/License Required usually)
const RESTRICTED_DESTINATIONS = ['Iran', 'North Korea', 'Syria', 'Cuba', 'Russia', 'Belarus'];

export function evaluateExport(formData) {
    const results = [];

    // 1. Basic Validation
    if (!formData.eccn) {
        return [{
            type: 'NLR',
            code: 'EAR99',
            title: 'No License Required (Likely)',
            justification: "No ECCN provided. Assuming EAR99 (low-tech consumer goods).",
            caveats: ["If this item is specially designed for military use, it may be ITAR controlled."],
            nextSteps: "Verify the item classification."
        }];
    }

    const eccnInfo = ECCN_DB[formData.eccn.toUpperCase()];
    const isRestrictedDest = RESTRICTED_DESTINATIONS.includes(formData.destination);
    const value = parseFloat(formData.value) || 0;

    // 2. Embargo Check
    if (isRestrictedDest) {
        return [{
            type: 'LICENSE_REQUIRED',
            code: 'EMBARGO',
            title: 'License Required / Embargoed',
            justification: `Export to ${formData.destination} is heavily restricted or embargoed.`,
            caveats: ["Most exports will be denied.", "Consult legal counsel immediately."],
            nextSteps: "Do not ship without explicit authorization."
        }];
    }

    // 3. Exception Logic (Agentic Suggestions)

    // LVS: Low Value Shipment
    // Logic: Controlled item, Value < 1500 (group B) or < 5000 (group A). Simplified to < 3000 for demo.
    if (eccnInfo && eccnInfo.exceptions.includes('LVS')) {
        if (value > 0 && value < 10000) {
            results.push({
                type: 'EXCEPTION',
                code: 'LVS',
                title: 'Shipment of Limited Value',
                justification: `The item is eligible for LVS exception because the declared value ($${value}) is below the threshold ($10,000) for this ECCN.`,
                caveats: ["Cannot split orders to meet the threshold.", "Not applicable to all destinations."],
                nextSteps: "Record 'LVS' on shipping documents."
            });
        }
    }

    // GOV: Government End Use
    if (formData.endUserType === 'Government' || formData.isGovernmentContract) {
        results.push({
            type: 'EXCEPTION',
            code: 'GOV',
            title: 'Government End-User',
            justification: `The destination is a Government entity. GOV exception applies to exports to cooperating governments.`,
            caveats: ["Ensure the agency is eligible.", "Consignee must be the government agency."],
            nextSteps: "Verify agency eligibility in EAR Part 740.11."
        });
    }

    // STA: Strategic Trade Authorization (Generic suggestion for 3A001 -> UK/Germany etc)
    if (formData.eccn === '3A001' && ['United Kingdom', 'Germany', 'Canada', 'Japan', 'Australia'].includes(formData.destination)) {
        results.push({
            type: 'EXCEPTION',
            code: 'STA',
            title: 'Strategic Trade Authorization',
            justification: `Exports of ${formData.eccn} to ${formData.destination} (Country Group A:5) are often eligible for STA.`,
            caveats: ["Requires consignee statement.", "Notification to BIS required."],
            nextSteps: "Obtain Prior Consignee Statement."
        });
    }

    // Fallback: If no exceptions found but item is controlled
    if (eccnInfo && results.length === 0) {
        results.push({
            type: 'LICENSE_REQUIRED',
            code: 'IVL',
            title: 'Individual Validated License',
            justification: `Item is controlled (${eccnInfo.controls.join(', ')}) and no obvious exceptions matched your criteria.`,
            caveats: ["Processing time can be 30-60 days."],
            nextSteps: "Apply for a license in SNAP-R."
        });
    }

    // Fallback: Unknown ECCN
    if (!eccnInfo && results.length === 0) {
        results.push({
            type: 'NLR',
            code: 'NLR',
            title: 'No License Required',
            justification: `ECCN '${formData.eccn}' is not in our restricted database. Assuming it is not controlled for this destination.`,
            caveats: ["Verify ECCN is correct."],
            nextSteps: "Proceed with shipment as NLR."
        });
    }

    return results;
}
