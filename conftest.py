"""Make packages importable without an editable install.
(For production, replace with `pip install -e packages/core packages/rules_engine packages/grounding`.)"""
import pathlib
import sys

_root = pathlib.Path(__file__).parent
for pkg in ("packages/core", "packages/rules_engine", "packages/grounding"):
    sys.path.insert(0, str(_root / pkg))
