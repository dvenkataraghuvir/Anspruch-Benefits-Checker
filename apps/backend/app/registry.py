"""The single place benefit modules are registered with the engine.
Adding a benefit later = add its module to this list. Nothing else changes."""
from rules_engine.modules.wohngeld.module import WohngeldModule
from rules_engine.protocol import BenefitModule


def all_modules() -> list[BenefitModule]:
    return [
        WohngeldModule(),
        # KindergeldModule(), KinderzuschlagModule(), ...  (later)
    ]
