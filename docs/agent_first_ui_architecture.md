# Agent-First UI Architecture (v2 - Bubble Stream)

This document describes the "Single-Pane" Agentic interface for ExportShield, now upgraded with **Bubble Stream Decomposition** and **3D Avatars**.

## 1. Core Concept
The user no longer interacts with forms or static dashboards. The Agent Chat is the **sole Interface**.
- **Input**: Natural language (e.g., "Check ECCN 5A002 to China").
- **Output**: A stream of "Bubbles" — Narrative Text + UI Components.
- **Visuals**: A persistent Spline 3D robot avatar acts as the brand identity.

## 2. Component Structure

### `AgentConsole.jsx` (Orchestrator)
- **Role**: Manages the Chat Stream and decomposition logic.
- **Decomposition**: The single JSON response from Python is split into multiple messages:
    1.  **Narrative**: "Based on your input..."
    2.  **StatusStrip**: Summary of License/DPS/UFLPA status.
    3.  **ExceptionList**: Detailed cards for license exceptions.
    4.  **RiskCards**: Alert cards for screening hits.
    5.  **NextSteps**: Action checklist.
- **Spline Integration**: Renders `SplineAvatar` in 'hero' mode (center) or 'avatar' mode (bottom-right).

### `AgentMessage.jsx` (The Renderer)
Polymorphic component that renders based on `message.component`:
- `StatusStrip`: Banner for quick status checks.
- `ExceptionList`: Stack of interactive cards (restored from legacy).
- `NextSteps`: Checklist.
- `ClarificationChips`: Interactive buttons for missing fields.

## 3. Data Flow

1.  **User Input** -> Frontend State (`messages`).
2.  **API Call**: `POST /agent`
3.  **Backend Return**: Giant JSON with `license_result`, `screenings`, etc.
4.  **Frontend Decomposition**:
    - `AgentConsole.decomposeResponse(json)` -> `[Bubble1, Bubble2, Bubble3...]`
    - These are appended to the chat timeline sequentially.
5.  **Render**: React renders the stream with animations.

## 4. UI/UX Polishing
- **Landing**: Marketing-style Hero with 3D robot.
- **Chat**: Clean single column.
- **Transitions**: Smooth scroll and fade-ins.
