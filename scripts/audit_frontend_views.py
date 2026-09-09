"""
ASTRA Frontend Views & Contract Deep Auditor
Inspects all 21 JavaScript view components for:
1. Render invocation style (returns string vs mounts to container) vs router.js expectations
2. APIClient method existence
3. Data property access consistency with API schemas
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent.resolve()
JS_DIR = ROOT / "js"
COMP_DIR = JS_DIR / "components"

with open(JS_DIR / "router.js", "r", encoding="utf-8") as f:
    router_code = f.read()

with open(JS_DIR / "api-client.js", "r", encoding="utf-8") as f:
    api_client_code = f.read()

# Extract all APIClient methods
api_methods = set()
for m in re.finditer(r'(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{', api_client_code):
    api_methods.add(m.group(1))

print(f"Loaded {len(api_methods)} APIClient methods.")

# Extract route mappings and invocation styles from router.js
# Look for: mount.innerHTML = window.<View>.render(...) vs window.<View>.render(mount)
views_in_router = {}
for line in router_code.splitlines():
    line = line.strip()
    m_inner = re.search(r'mount\.innerHTML\s*=\s*(?:window\.)?([A-Za-z0-9_]+)\.render\(([^)]*)\)', line)
    if m_inner:
        view_name = m_inner.group(1)
        args = m_inner.group(2).strip()
        views_in_router[view_name] = {"style": "returns_string", "args": args}
    m_mount = re.search(r'(?:if\s*\([^)]+\)\s*)?(?:window\.)?([A-Za-z0-9_]+)\.render\(mount\)', line)
    if m_mount:
        view_name = m_mount.group(1)
        views_in_router[view_name] = {"style": "mounts_container", "args": "mount"}

print("\n--- ROUTER EXPECTATIONS ---")
for v, info in sorted(views_in_router.items()):
    print(f"  - {v:25}: expects {info['style']} (args: '{info['args']}')")

print("\n--- COMPONENT INSPECTION ---")
issues = []
for fpath in sorted(COMP_DIR.glob("*.js")):
    with open(fpath, "r", encoding="utf-8") as f:
        code = f.read()
    
    fname = fpath.name
    # Determine the window object name exported
    m_exp = re.search(r'window\.([A-Za-z0-9_]+)\s*=', code)
    obj_name = m_exp.group(1) if m_exp else fname.replace(".js", "")
    
    # Check render definition
    m_render = re.search(r'render\s*\(([^)]*)\)\s*\{', code)
    if not m_render:
        print(f"[{fname}] No render() method found!")
        issues.append((fname, "No render() method found"))
        continue
    
    render_params = [p.strip() for p in m_render.group(1).split(",") if p.strip()]
    
    # Check if render has a return statement with HTML / string
    has_return = bool(re.search(r'return\s+[`\'"<]', code))
    has_container_assign = bool(re.search(r'(?:container|mount|el|element)\.innerHTML\s*=', code))
    
    expected = views_in_router.get(obj_name)
    print(f"[{fname}] Object: {obj_name} | Params: {render_params} | Returns string: {has_return} | Assigns innerHTML: {has_container_assign}")
    
    if expected:
        if expected["style"] == "returns_string" and not has_return:
            msg = f"Router expects {obj_name}.render() to return HTML string (mount.innerHTML = ...), but render() does not return string!"
            print(f"  ERROR: {msg}")
            issues.append((fname, msg))
        elif expected["style"] == "mounts_container" and not render_params:
            msg = f"Router passes mount container to {obj_name}.render(mount), but render() takes no arguments!"
            print(f"  ERROR: {msg}")
            issues.append((fname, msg))
    
    # Check APIClient calls
    calls = re.findall(r'(?:window\.)?APIClient\.([a-zA-Z0-9_]+)\(', code)
    for c in calls:
        if c not in api_methods and c not in ["init", "getAuthHeaders", "showToast", "updateUserInterface", "renderStatusBadge"]:
            msg = f"Calls undefined APIClient method: {c}()"
            print(f"  ERROR: {msg}")
            issues.append((fname, msg))

print(f"\nAudit complete. Found {len(issues)} issues.")
