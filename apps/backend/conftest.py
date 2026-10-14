import pathlib
import sys

_here = pathlib.Path(__file__).resolve().parent          # apps/backend
_root = _here.parents[1]                                  # repo root

# monorepo packages
for pkg in ("packages/core", "packages/rules_engine"):
    sys.path.insert(0, str(_root / pkg))
# so `import app...` resolves
sys.path.insert(0, str(_here))
