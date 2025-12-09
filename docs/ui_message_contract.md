# ExportShield UI Message Contract

This document defines the strict JSON contract between the `AgentOrchestrator` (Backend) and the `AgentConsole` (Frontend).

## 1. Top-Level Response (`/agent` endpoint)

The backend returns a JSON object with this structure:

```json
{
  "messages": [
    { "role": "assistant", "kind": "text", "content": "..." },
    { "role": "assistant", "kind": "analysis_result", "data": { ... } }
  ],
  "shipment_context": {
    "eccn": "5A002",
    "destination": "France",
    "value": 5000,
    ...
  },
  "mood": "success" | "warning" | "thinking" | "idle"
}
```

## 2. Message Types

### Type A: Text Bubble (`kind="text"`)
Standard narrative response.

```json
{
  "role": "assistant",
  "kind": "text",
  "content": "I've analyzed the shipment. A license exception is available."
}
```

### Type B: Analysis Result (`kind="analysis_result"`)
Triggers the **Composite Smart Bubble** (ComplianceTabs).

```json
{
  "role": "assistant",
  "kind": "analysis_result",
  "data": {
    "license": {
      "status": "CLEAR" | "WARNING" | "RESTRICTED",
      "exceptions": [
        { "code": "ENC", "description": "...", "section": "740.17" }
      ],
      "trace": ["Step 1", "Step 2"]
    },
    "screenings": [
      { "engine": "DPS", "outcome": "MATCH", "matches": [...] }
    ],
    "documents": {
        "report_url": "...",
        "audit_log_url": "..."
    }
  }
}
```

### Type C: Clarification Request (`kind="clarification"`)
Triggers the **Input Chips** UI.

```json
{
  "role": "assistant",
  "kind": "clarification",
  "content": "I need the destination country.",
  "missing_fields": ["destination"],
  "suggestions": ["China", "Germany", "United Kingdom"]
}
```

## 3. Frontend Component Mapping

| Message Kind | Component | Description |
| :--- | :--- | :--- |
| `text` | `<AgentMessage bubble={true}>` | Simple styled text bubble. |
| `analysis_result` | `<ComplianceTabs data={msg.data}>` | Tabbed card with Exceptions, Risks, Trace. |
| `clarification` | `<ClarificationChips options={msg.suggestions}>` | Interactive chips to quick-fill data. |

## 4. Robot Moods

The backend calculates a mood based on the result severity:

- **Thinking**: While request is in flight.
- **Success**: License found (CLEAR) or Exception found.
- **Warning**: License REQUIRED (RESTRICTED), or DPS/UFLPA MATCH.
- **Idle**: Default state.
