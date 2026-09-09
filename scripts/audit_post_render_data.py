"""
Audits postRender methods and data contracts between APIClient responses and view DOM updates.
"""

import re
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent.resolve()
JS_DIR = ROOT / "js"
COMP_DIR = JS_DIR / "components"

for js_file in sorted(COMP_DIR.glob("*View.js")):
    with open(js_file, "r", encoding="utf-8") as f:
        code = f.read()
    
    print(f"\n=== {js_file.name} ===")
    # Find all APIClient calls inside this file
    calls = re.findall(r'(?:await\s+)?(?:window\.)?APIClient\.([a-zA-Z0-9_]+)\(([^)]*)\)', code)
    print(f"API calls ({len(calls)}):")
    for method, args in calls:
        print(f"  - APIClient.{method}({args.strip()})")

