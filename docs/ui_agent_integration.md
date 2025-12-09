# UI Agent Integration Guide

## Overview
The frontend now integrates with the backend Agent Orchestrator via a unified client module (`src/api/agentClient.js`). This ensures that both the "Evaluate Shipment" form and the "Chat Assistant" interface share the same logic and backend brain.

## Key Components

### 1. Agent Client (`src/api/agentClient.js`)
Centralizes API calls and data mapping.
- **`runShipmentEvaluation(formData)`**: Sends a structured shipment case + "Please evaluate this shipment" message to `/agent`.
- **`runAgentChat(history, context)`**: Sends full chat history + current form context to `/agent`.
- **`mapAgentToLegacy(agentResponse)`**: Transforms the new `AgentResponse` structure (ShipmentCase, screenings list, etc.) into the legacy structure expected by React components (`license_results`, `uflpa_results`, etc.).

### 2. Form Integration (`ComplianceForm.jsx`)
- **Action**: Users click "Evaluate Shipment".
- **Flow**:
    1. `handleSubmit` calls `agentClient.runShipmentEvaluation(formData)`.
    2. Receives `AgentResponse`.
    3. Maps response using `mapAgentToLegacy`.
    4. Updates state (`results`, `dpsResult`, `uflpaResult`, `aiSuggestion`).
- **Benefit**: The form now benefits from the Agent's intent inference (though intent is explicit here) and synthesized summaries.

### 3. Chat Integration (`ChatInterface.jsx`)
- **Action**: Users type in the chat box.
- **Flow**:
    1. Appends user message to local history.
    2. Calls `agentClient.runAgentChat(history, formContext)`.
    3. Displays `response.message` (Natural Language) from the Agent.
- **Benefit**: The chat assistant has full visibility of the shipment context and uses the same regulatory knowledge base.

## Assumptions & Limitations
- **State mapping**: We bridge the new agent schema to the old component props to assume minimal UI refactoring.
- **Session History**: The frontend currently manages chat history in-memory. A refresh clears it.
- **Error Handling**: API errors are caught and displayed in the respective component UI (red text in Form, error message in Chat).

## Verification
- **Case A (Form)**: Submit ECCN 6A003/China -> Result Cards update + Synthesis text in AI Insight.
- **Case B (Chat)**: Ask "What is LVS?" -> Returns text explanation.
- **Case C (Context)**: Fill form (5A002/France), then ask Chat "Does this need a license?" -> Agent sees context and answers "Likely not (ENC exception)...".
