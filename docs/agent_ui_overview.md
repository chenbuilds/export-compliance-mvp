# Agent Console & Workspace OverviewV2

## Architecture

The Agent Console is the primary interface for ExportShield. It has evolved from a static form to an **Adaptive AI Workspace**.

### Core Layout Mode

1.  **Landing Mode (AI-First)**:
    *   **Trigger**: No conversation history (start of session).
    *   **Layout**: Single column, centered content.
    *   **Elements**:
        *   **3D Motion Identity**: "ExportShield Intelligence" abstract visualization.
        *   **Omni-Input**: Large, central chat/command bar.
        *   **Adaptive Recommendations**: `RecommendedTools` component usage buttons based on user history.

2.  **Workspace Mode (Split View)**:
    *   **Trigger**: User sends a message or selects a tool.
    *   **Layout**:
        *   **Left (400px)**: Chat history (standard messaging interface).
        *   **Right (Flex)**: `AgentWorkspace` containing the Live Case View.

## Components

### `AgentConsole.jsx`
The orchestrator. Manages:
*   `messages`: Conversation state.
*   `usageStats`: Lightweight behavioral tracking (e.g., license vs. screening usage).
*   `isLanding`: Toggles between Landing and Workspace modes.

### `AgentWorkspace.jsx`
The "brain" visualization.
- **MasterCaseSummary**: High-level traffic light status.
- **ShipmentForm**: "Detected Details" (collapsible to keep focus on results).
- **ComplianceStoryboard**: The "Narrative" trace of the decision.
- **ResultsPanel**: Detailed exception cards and risk flags.

### `RecommendedTools.jsx` (New)
An adaptive component that highlights specific buttons (e.g., "Run License Check" vs "Run Screening") based on the `usageStats` count.

## Data Flow
1.  User types in **Omni-Input** (Landing or Chat).
2.  `src/api/agentClient.js` calls the backend `/agent`.
3.  Backend acts as the brain (Gemini 2.0), returning `AgentResponse`.
4.  `AgentConsole` processes the response:
    *   Updates `ShipmentForm` data.
    *   Updates `Results/Trace`.
    *   Increments `usageStats` (e.g., `licenseChecks++`).
    *   Appends natural language response to Chat.

## Extension & Customization
- **To add new adaptive tools**: Update `RecommendedTools.jsx` to read new keys from `usageStats`.
- **To change the landing visual**: Replace `ThreeDAnimationPlaceholder.jsx` with a WebGL canvas.
