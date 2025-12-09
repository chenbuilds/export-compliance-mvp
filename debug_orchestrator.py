import sys
import os
import json

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.agent_orchestrator import AgentOrchestrator
from backend.data_models import ShipmentCase
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    print("NO API KEY")
    model = None

orch = AgentOrchestrator(model=model)

# Context from previous turns
context = {
    "eccn": "5A002", # Inferred from loop but let's assume valid
    "destination": "China"
}

# Message causing crash
messages = [
    {"role": "user", "content": "Check license"},
    {"role": "assistant", "content": "I need details."},
    {"role": "user", "content": "Destination is China"},
    {"role": "assistant", "content": "Got it."},
    {"role": "user", "content": "ECCN 5A002, Value $5000"}
]

print("Running Debug Orchestrator...")
try:
    res = orch.process_request(messages, context)
    print("Success!")
    print(json.dumps(res, indent=2, default=str))
except Exception as e:
    print(f"CRASH: {e}")
    import traceback
    traceback.print_exc()
