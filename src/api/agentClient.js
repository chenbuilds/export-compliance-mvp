/**
 * agentClient.js
 * Client for the new backend /agent endpoint.
 * Handles shipment evaluation and chat interactions via the Agent Orchestrator.
 */

import { API_URL } from '../config/api';

/**
 * Calls the /agent endpoint.
 * @param {Array} messages - Chat history [{role, content}]
 * @param {Object} context - Structured shipment data (eccn, destination, etc.)
 * @returns {Promise<Object>} - AgentResponse
 */
async function callAgent(messages, context) {
    // Ensure context has valueUsd mapped if available so we don't depend on Orchestrator doing it all (though it does)
    // Actually, let's just pass what we have.

    const payload = {
        messages,
        context
    };

    const response = await fetch(`${API_URL}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent API Error: ${response.status} ${errorText}`);
    }

    return await response.json();
}

/**
 * Runs a full shipment evaluation via the agent.
 * Simulates a "Please evaluate this shipment" command.
 * @param {Object} formData - The raw form data from ComplianceForm
 * @returns {Promise<Object>} - The raw AgentResponse
 */
export async function runShipmentEvaluation(formData) {
    const messages = [
        { role: 'user', content: 'Please evaluate this shipment.' }
    ];

    // Map frontend keys to what the Agent expects if needed, 
    // but the AgentOrchestrator now handles camelCase mapping (endUserType, etc).
    // so we can pass formData directly as context.
    const context = { ...formData };

    // Ensure value is numeric for safety
    if (context.value) {
        context.valueUsd = parseFloat(context.value);
    }

    return await callAgent(messages, context);
}

/**
 * Runs a chat interaction.
 * @param {Array} history - Full message history
 * @param {Object} currentContext - Current form data context
 * @returns {Promise<Object>} - The raw AgentResponse
 */
export async function runAgentChat(history, currentContext) {
    return await callAgent(history, currentContext);
}

/**
 * Helper to map the new AgentResponse structure to the legacy structure
 * expected by ComplianceForm and result cards.
 * 
 * New: { license_result, screenings: [ {engine: 'DPS'...}, {engine: 'UFLPA'...} ], message }
 * Legacy: { license_results: { results: [], trace: [] }, uflpa_results, dps_results, ai_insight }
 */
export function mapAgentToLegacy(agentResponse) {
    const legacy = {
        license_results: null,
        uflpa_results: null,
        dps_results: null,
        ai_insight: agentResponse.message || "No insight generated."
    };

    // 1. License
    if (agentResponse.license_result) {
        legacy.license_results = {
            status: agentResponse.license_result.status,
            results: agentResponse.license_result.exceptions || [],
            trace: agentResponse.license_result.trace || []
        };

        // If status is WARNING/RESTRICTED and no exceptions, ensure we have a "result" item so UI shows red card
        // The backend Engine typically adds a "LICENSE_REQUIRED" item in 'results'/'exceptions' list if it fails.
        // We verified this in sanity check ("exceptions": [{ "code": "LIC_REQ"... }]).
    }

    // 2. Screenings -> DPS & UFLPA
    if (agentResponse.screenings) {
        const dps = agentResponse.screenings.find(s => s.engine === 'DPS');
        const uflpa = agentResponse.screenings.find(s => s.engine === 'UFLPA');

        if (dps) {
            legacy.dps_results = {
                status: dps.outcome, // MATCH / CLEAR / BLOCKED
                matches: dps.matches,
                message: dps.reasoning ? dps.reasoning[0] : ""
            };
        }

        if (uflpa) {
            legacy.uflpa_results = {
                risk_level: uflpa.risk_level, // CRITICAL / HIGH / CLEAR
                matches: uflpa.matches.match, // Structure might vary, backend sends {match: {entity: bool...}}
                reasons: uflpa.reasoning
            };
        }
    }

    return legacy;
}
