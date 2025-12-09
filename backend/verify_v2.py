
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from license_exceptions_engine import run_license_exception_engine
from forced_labour_screening import screen_forced_labour

def print_separator(title):
    print(f"\n--- {title} ---")

def test_scenario_1():
    print_separator("Scenario 1: High Risk (6A003 -> China + Xinjiang Cotton)")
    
    # 1. License Check
    lic_res = run_license_exception_engine(
        eccn='6A003',
        destination='China',
        value=50000,
        end_user_type='Military'
    )
    print(f"License Status: {lic_res['status']}")
    print(f"Exceptions: {[r['code'] for r in lic_res['results']]}")
    
    # 2. Forced Labour Check
    uflpa_res = screen_forced_labour(
        supplier="Xinjiang Cotton Co",
        commodity="Textiles",
        origin="China",
        region="Xinjiang"
    )
    print(f"UFLPA Risk: {uflpa_res['risk_level']}")
    print(f"UFLPA Action: {uflpa_res.get('action')}")

def test_scenario_2():
    print_separator("Scenario 2: Low Risk (EAR99 -> United Kingdom + No UFLPA)")
    
    # 1. License Check
    lic_res = run_license_exception_engine(
        eccn='EAR99',
        destination='United Kingdom',
        value=1000,
        end_user_type='Commercial'
    )
    print(f"License Status: {lic_res['status']}")
    print(f"Exceptions: {[r['code'] for r in lic_res['results']]}")
    
    # 2. Forced Labour Check (Empty inputs simulating skipped check)
    uflpa_res = screen_forced_labour()
    print(f"UFLPA Risk: {uflpa_res['risk_level']}")

if __name__ == "__main__":
    test_scenario_1()
    test_scenario_2()
