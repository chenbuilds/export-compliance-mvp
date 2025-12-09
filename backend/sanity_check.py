import requests
import json
import sys

# Port 5001 is what app.py is configured for in the code.
# User mentioned 5000, but I will try 5001 first as it matches the file content.
url = 'http://localhost:5001/agent'

payload = {
  "messages": [
    { "role": "user", "content": "Please evaluate this complete shipment." }
  ],
  "context": {
    "eccn": "6A003",
    "destination": "China",
    "valueUsd": 2500,
    "endUserName": "Huawei Technologies",
    "supplier": "Xinjiang Cotton Co",
    "commodity": "camera equipment"
  }
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Response JSON:")
        print(json.dumps(data, indent=2))
        
        # Validation Logic
        failures = []
        if data.get("intent") != "full_check":
            failures.append(f"Intent mismatch: Got {data.get('intent')}, expected 'full_check'")
        
        if not data.get("license_result"):
            failures.append("Missing license_result")
            
        screenings = data.get("screenings", [])
        has_dps = any(s.get("engine") == "DPS" for s in screenings)
        has_uflpa = any(s.get("engine") == "UFLPA" for s in screenings)
        
        if not has_dps: failures.append("Missing DPS screening")
        if not has_uflpa: failures.append("Missing UFLPA screening")
        
        # Check if value matches (to see if mapping worked)
        shipment_value = data.get("shipment", {}).get("value")
        if shipment_value != 2500:
            failures.append(f"Value mismatch: Got {shipment_value}, expected 2500 (valueUsd parsing issue?)")

        if failures:
            print("\nFAILED Checks:")
            for f in failures:
                print(f"- {f}")
            sys.exit(1)
        else:
            print("\nSUCCESS: All checks passed.")
            sys.exit(0)
    else:
        print(f"Request failed: {response.text}")
        sys.exit(1)
        
except requests.exceptions.ConnectionError:
    print(f"Could not connect to {url}. Is the server running?")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
