*   **Action**: User types a natural language query (e.g., "Check ECCN 5A002 to France").
*   **Transition**:
    1.  `AgentConsole` optimistically adds the user message to the UI.
    2.  The view animates to **Split-Screen Workspace**.
    3.  A request is sent to `/agent` with `history` + empty `context`.

### Path B: Workspace (Active State)
*   **UI**: Split View (Left: Chat, Right: Live Case View).
*   **Action**: User refines the request (e.g., "Change destination to Germany") or uses a Tool Chip.
*   **Data Flow**:
    1.  Request sent to `/agent` with full `history` + current `formData` (Live Case View state).
    2.  Agent infers updates based on context.

## 2. Intent Inference & "Missing Fields"

The backend `AgentOrchestrator` uses a specialized prompt to analyze the conversation.

### Structure
It returns an internal JSON object:
```json
{
  "intent": "license_check",
  "shipment_updates": { "eccn": "5A002", "destination": "France" },
  "missing_fields": [],
  "needs_clarification": false
}
```

### Clarification Logic
If the user asks for a check but provides partial data (e.g., "Check ECCN 5A002"):
1.  **Intent** is identified as `license_check`.
2.  **Missing Fields** are identified (e.g., `["destination", "value"]`).
3.  **Tool Execution**: The orchestrator *skips* the tool execution to prevent errors.
4.  **Synthesis**: The LLM sees the missing fields and generates a natural language response asking for them.
    *   *Agent*: "I can check that for you. What is the destination country and shipment value?"

## 3. Error Handling

### Network / Server Errors (500s)
*   **Frontend**: Catches exceptions and displays a polite "Connection Error" bubble in the chat, keeping the app usable.
*   **Backend**: All tool executions are wrapped in `try/except` blocks. If an engine fails, it returns `None` for that result, allowing the Agent to explain the situation ("I couldn't complete the license check...") rather than crashing the request.

## 4. Usage Statistics (Adaptive UI)

The frontend maintains a lightweight `usageStats` object:
```javascript
{
  licenseChecks: 5,
  screenings: 1,
  uploads: 0
}
```
*   **Logic**: Incremented when the Agent returns valid results for a category.
*   **Effect**: The `RecommendedTools` component highlights the most frequently used actions (e.g., "License Check" gets a blue highlight after 2 uses).

## 5. ECCN & Entity Parsing

*   **Extraction**: performed by Gemini 2.0 Flash in the `infer_intent` step.
*   **Normalization**: The orchestrator maps backend `snake_case` models to frontend `camelCase` forms automatically, ensuring bi-directional sync between the Chat/Agent and the React Form.
