import sys
import os
import json

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app import app
from agent_orchestrator import AgentOrchestrator

# Mocking intent
original_infer = AgentOrchestrator.infer_intent
def mock_infer(self, messages, context):
    return {
        "intent": "license_check", 
        "shipment_updates": {"eccn": "5A002", "destination": "FR", "value": 1000}, 
        "missing_fields": [], 
        "needs_clarification": False
    }
AgentOrchestrator.infer_intent = mock_infer

client = app.test_client()

print("Sending 'check 5A002 to France'...")
response = client.post('/agent', json={
    "messages": [{"role": "user", "kind": "text", "content": "check 5A002 to France"}], 
    "context": {}
})

print(f"Status: {response.status_code}")
data = response.get_json()
print(json.dumps(data, indent=2))

# Verify Structure
input_msg = data.get('messages', [])
text_msg = next((m for m in input_msg if m['kind'] == 'text'), None)
card_msg = next((m for m in input_msg if m['kind'] == 'analysis_result'), None)

if text_msg and card_msg:
    print("\nSUCCESS: Found both Text Bubble and Analysis Card.")
    print(f"Text: {text_msg['content']}")
else:
    print("\nFAILURE: Missing expected message types.")
