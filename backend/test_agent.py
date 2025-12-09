import unittest
import requests
import json
import os
import sys

# Ensure backend directory is in path for imports if needed, 
# but we are testing via HTTP request to the running server.
BASE_URL = "http://localhost:5001"

class TestAgentEndpoint(unittest.TestCase):
    
    def test_01_full_shipment_with_screenings(self):
        """Test a case that should trigger License + DPS + UFLPA."""
        print("\n--- Test 01: Full Shipment (License + DPS + UFLPA) ---")
        payload = {
            "messages": [{"role": "user", "content": "Please evaluate this complete shipment."}],
            "context": {
                "eccn": "6A003", # Cameras - Stricter than 5A002
                "destination": "China",
                "value": 2500, # Over LVS limit (1500)
                "endUserName": "Huawei Technologies",
                "endUserType": "Commercial", 
                "supplier": "Xinjiang Cotton Co",
                "commodity": "Raw Cotton"
            }
        }
        
        response = requests.post(f"{BASE_URL}/agent", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify Structure
        self.assertIn("shipment", data)
        self.assertIn("intent", data)
        self.assertIn("message", data)
        
        # Verify Logic
        # License should run
        self.assertIsNotNone(data.get("license_result"), "License Logic should have run")
        # 5A002 to China (D:1) for Military (not Commercial) -> ENC fails -> WARNING
        self.assertEqual(data["license_result"]["status"], "WARNING")
        
        # DPS should run (Huawei)
        screenings = data.get("screenings", [])
        dps = next((s for s in screenings if s["engine"] == "DPS"), None)
        self.assertIsNotNone(dps, "DPS Logic should have run")
        if dps:
            self.assertEqual(dps["outcome"], "BLOCKED") 

        # UFLPA should run (Xinjiang)
        uflpa = next((s for s in screenings if s["engine"] == "UFLPA"), None)
        self.assertIsNotNone(uflpa, "UFLPA Logic should have run")
        if uflpa:
            self.assertEqual(uflpa["risk_level"], "SEIZURE_LIKELY") # Xinjiang keyword

        print(f"Intent inferred: {data['intent']}")
        print(f"Agent Message: {data['message']}")

    def test_02_license_only(self):
        """Test a clean license check."""
        print("\n--- Test 02: License Only (5A002 to UK) ---")
        payload = {
            "messages": [{"role": "user", "content": "Checking license for 5A002 to United Kingdom."}],
            "context": {}
        }
        response = requests.post(f"{BASE_URL}/agent", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn(data["intent"], ["license_check", "full_check"])
        self.assertIsNotNone(data.get("license_result"))
        # 5A002 to UK (A:1) -> usually ENC or other exception
        # self.assertTrue(any(e['code'] == 'ENC' for e in data['license_result']['exceptions']))
        
        # Should NOT run UFLPA/DPS
        screenings = data.get("screenings", [])
        self.assertEqual(len(screenings), 0, "No screenings should run for pure license check")
        
    def test_03_general_qa(self):
        """Test pure Q&A."""
        print("\n--- Test 03: General Q&A ---")
        payload = {
            "messages": [{"role": "user", "content": "What is the capital of France? (Just testing QA)"}],
            "context": {}
        }
        response = requests.post(f"{BASE_URL}/agent", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["intent"], "general_qa")
        self.assertEqual(len(data.get("screenings", [])), 0)
        self.assertIsNone(data.get("license_result"))
        print(f"QA Response: {data['message']}")

if __name__ == '__main__':
    unittest.main()
