import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5001/agent"

def run_test(name, payload, expected_kind, expected_status=None):
    print(f"--- Running Test: {name} ---")
    try:
        response = requests.post(
            BASE_URL, 
            json=payload, 
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        # Analyze Response
        messages = data.get('messages', [])
        found_kind = False
        found_status = False
        
        print(f"Messages received: {len(messages)}")
        for m in messages:
            kind = m.get('kind')
            print(f" - Kind: {kind}")
            if kind == expected_kind:
                found_kind = True
                if expected_status:
                    card_data = m.get('data', {})
                    # Check for verdict card status or risk box outcome
                    if kind == 'verdict_card':
                        if card_data.get('status') == expected_status:
                            found_status = True
                        else:
                            print(f"   [!] Wrong Status: Got {card_data.get('status')}, Expected {expected_status}")
                    elif kind == 'risk_box':
                        # Check UFLPA outcome
                        uflpa = card_data.get('uflpa')
                        if uflpa and uflpa.get('outcome') == expected_status:
                            found_status = True
            
            # Special check for blocking form
            if kind == 'requirements_pack' and expected_kind != 'requirements_pack':
                print(f"   [!] FAILURE: Blocked by Requirements Pack unexpectedly!")

        if found_kind:
            if expected_status and not found_status:
                print(f"❌ FAILED: Found {expected_kind} but status mismatch.")
            else:
                print(f"✅ PASSED: Found {expected_kind}")
                # Optional: Check for optimization tip if expected
                if expected_kind == 'verdict_card' and 'Minimal' in name:
                     has_tip = any(m.get('kind') == 'optimization_tip' for m in messages)
                     if has_tip: print("   ✅ Verified: Optimization Tip present.")
                     else: print("   ❌ FAILED: Optimization Tip MISSING.")
        else:
            print(f"❌ FAILED: Did not find expected message kind '{expected_kind}'")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
    print("\n")

def main():
    # 1. Minimal Valid (Should NOT Block)
    run_test(
        "Minimal Valid (ECCN+Dest)",
        {
            "messages": [{"role": "user", "content": "Check 5A002 to France"}],
            "shipment": {}
        },
        "verdict_card",
        "CLEAN" # Or RESTRICTED depending on logic, but main point is it shows Verdict
    )

    # 2. Missing Required (Should Block)
    run_test(
        "Missing Required (Only Dest)",
        {
            "messages": [{"role": "user", "content": "Check shipment to Germany"}],
            "shipment": {}
        },
        "requirements_pack"
    )

    # 3. Valid + Optional Missing (Should NOT Block)
    run_test(
        "Valid + Optional Missing (ECCN+Dest, No Value)",
        {
            "messages": [{"role": "user", "content": "Check 5A002 to Germany"}],
            "shipment": {"eccn": "5A002", "destination": "Germany"}
        },
        "verdict_card"
    )

    # 4. UFLPA Risk (Should Warn)
    run_test(
        "UFLPA High Risk (Xinjiang)",
        {
            "messages": [{"role": "user", "content": "Check solar panels from Xinjiang Corp"}],
            "shipment": {}
        },
        "risk_box", # We expect a risk box with WARNING
        "WARNING"   # UFLPA status
    )
    
    # 5. High Value (Logic Check)
    run_test(
        "High Value (5A002 > $5000)",
        {
            "messages": [{"role": "user", "content": "Check 5A002 to France value $10000"}],
            "shipment": {}
        },
        "verdict_card"
    )

if __name__ == "__main__":
    main()
