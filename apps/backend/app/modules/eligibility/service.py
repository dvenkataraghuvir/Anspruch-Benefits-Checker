from functools import lru_cache

from anspruch_core.types import EligibilityResult, UserSituation
from rules_engine.engine import EligibilityEngine

from app.registry import all_modules


@lru_cache
def get_engine() -> EligibilityEngine:
    return EligibilityEngine(all_modules())


def assess_situation(situation: UserSituation) -> list[EligibilityResult]:
    return get_engine().assess_all(situation)
