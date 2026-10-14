"""The interface every benefit module implements. Adding a benefit means
writing one of these plus a manifest — the engine never changes."""
from __future__ import annotations

from datetime import date
from typing import Protocol, runtime_checkable

from anspruch_core.types import EligibilityResult, UserSituation


@runtime_checkable
class BenefitModule(Protocol):
    program_id: str
    version: str
    effective_from: date
    effective_to: date | None

    def required_attributes(self) -> list[str]:
        """UserSituation fields that must be present. If any is blank, the
        engine returns CANNOT_DETERMINE before calling assess()."""
        ...

    def assess(self, situation: UserSituation) -> EligibilityResult:
        """Assume required_attributes() are present. Return a result.
        Raising is allowed — the engine converts it to UNAVAILABLE."""
        ...
