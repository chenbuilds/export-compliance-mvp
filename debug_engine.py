from license_exceptions_engine import run_license_exception_engine

try:
    print("Testing License Engine...")
    res = run_license_exception_engine("5A002", "China", 5000.0, "Commercial")
    print("Success:", res)
except Exception as e:
    print("CRASH:", e)
    import traceback
    traceback.print_exc()
