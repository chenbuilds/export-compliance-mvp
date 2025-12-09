import sys
import os

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.license_exceptions_engine import run_license_exception_engine

print("Running Debug Tests...")

cases = [
    ("5A002", "China", 5000.0, "Commercial"),
    ("5A002", "China", 0.0, "Commercial"),
    ("5A002", "China", "5000", "Commercial"), # Should crash if not handled but engine expects valid inputs
]

for eccn, dest, val, user in cases:
    print(f"\n--- Testing {eccn} to {dest} (${val}) ---")
    try:
        res = run_license_exception_engine(eccn, dest, val, user)
        print("Success")
    except Exception as e:
        print(f"CRASH: {e}")
