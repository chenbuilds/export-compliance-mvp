# ExportShield V2: System Architecture & Engineering Guide

## 1. System Overview
ExportShield V2 is a dual-engine export compliance platform designed to simulate professional trade compliance workflows. It is split into two distinct specialized modules:
1.  **License Exceptions Engine:** Determines EAR license requirements and evaluates exception eligibility (LVS, STA, ENC, etc.).
2.  **Forced Labour Screening Engine:** Screens supply chains for UFLPA risks based on entity, commodity, and region.

## 2. Data Architecture

### ECCN & Rule Data (`backend/license_exceptions_engine.py`)
-   **Storage:** ECCN technical parameters are stored in a python dictionary `ECCN_DB` within the module.
-   **Structure:** Keyed by ECCN (e.g., '3A001'), each entry contains:
    -   `controls`: Reasons for control (NS, AT, MT, etc.)
    -   `exceptions`: List of eligible exception codes (LVS, GBS, STA, etc.)
    -   `lvs_limit`: Dollar threshold for LVS exception.
    -   `description`: Short summary string.

### Country Groups (`backend/data/country_groups.json`)
-   **Source:** Digitized mapping of BIS Country Chart (Supplement No. 1 to Part 738).
-   **Format:** JSON object mapping Country Name -> BIS Groups (A:1, B, D:1, E:1, etc.).
-   **Usage:** Loaded dynamically to determine embargo status (E:1) and exception eligibility (e.g., GBS requires Group B).

### UFLPA Risk Data (`backend/forced_labour_screening.py`)
-   **Entities:** Mocked dictionary `UFLPA_ENTITY_LIST` simulating the DHS UFLPA Entity List.
-   **Commodities:** List `HIGH_RISK_COMMODITIES` (Cotton, Polysilicon, etc.).
-   **Logic:** Heuristic matching (Substring match on Supplier Name, Commodity, and Origin).

## 3. AI / LLM Integration (Gemini)

-   **Model:** Google Gemini (via `google-generativeai`).
-   **Role:** Synthesizer and Summarizer. The core compliance logic is **deterministic** (Python code), not AI-generated. The AI is used to:
    1.  Summarize findings into a "specialist narrative".
    2.  Provide context on "Next Steps" or "Red Flags".
-   **Prompt Engineering:**
    -   Inputs: Structured JSON results from License and UFLPA engines.
    -   Prompt: "Act as an Export Compliance Specialist... Provide 2 concise paragraphs..."
-   **Fallback:** If Gemini API fails, the system falls back to the deterministic "hard" results (Red/Green status indicators).

## 4. Engineering Rationale

### Why separate engines?
Refactoring into `license_exceptions_engine` and `forced_labour_screening` allows:
-   **Independent scaling:** UFLPA logic changes frequently (new entity lists) vs EAR logic (legislative updates).
-   **Modularity:** Different teams can own different risk domains.
-   **Performance:** Parallel execution of checks.

### Why hardcoded dicts?
For the MVP, Python dictionaries provide O(1) lookup speed and are easiest to modify/version-control compared to a database. Migration to a SQL table or Vector DB is the natural next step for scaling to 3000+ ECCNs.

## 5. Limitations & Known Issues

-   **Coverage:** only ~50 common ECCNs are implemented.
-   **UFLPA Data:** The Entity List is a static mock. Real-world implemention requires API integration with a data provider (like Kharon or Sayari).
-   **Logic:**
    -   "De Minimis" calculations for re-exports are not implemented.
    -   Complex encryption notes (Note 4 vs Note 5) are simplified.
    -   OFAC Sanctions (SDN List) are separate from DPS and currently experimental.

## 6. Onboarding for Engineers

### How to add a new ECCN
1.  Open `backend/license_exceptions_engine.py`.
2.  Add an entry to `ECCN_DB`:
    ```python
    '9A991': {'controls': ['AT'], 'exceptions': ['LVS', 'TMP'], 'lvs_limit': 5000, ...}
    ```

### How to update UFLPA High-Risk Sectors
1.  Open `backend/forced_labour_screening.py`.
2.  Append to `HIGH_RISK_COMMODITIES` list (e.g., "COBALT").

### Testing
-   Run the server: `python backend/app.py`
-   Use the frontend toggle "Enable UFLPA Check" to verify new logic triggers.
