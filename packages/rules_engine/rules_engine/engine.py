"""The deterministic eligibility engine. No LLM, no network, no I/O.

Responsibilities:
  * select the rule version valid on situation.as_of
  * short-circuit to CANNOT_DETERMINE when required inputs are blank
  * convert any module exception into a safe UNAVAILABLE result
It NEVER invents amounts — that is each module's job, from official figures.
"""
from __future__ import annotations

from datetime import date

from anspruch_core.types import EligibilityResult, ResultState, UserSituation

from .protocol import BenefitModule


def _is_blank(value: object) -> bool:
    return value is None or value == [] or value == ""


class EligibilityEngine:
    def __init__(self, modules: list[BenefitModule]) -> None:
        self._modules = list(modules)

    def active_modules(self, as_of: date) -> list[BenefitModule]:
        out: list[BenefitModule] = []
        for m in self._modules:
            after_start = m.effective_from <= as_of
            before_end = m.effective_to is None or as_of <= m.effective_to
            if after_start and before_end:
                out.append(m)
        return out

    def assess_all(self, situation: UserSituation) -> list[EligibilityResult]:
        results: list[EligibilityResult] = []
        for m in self.active_modules(situation.as_of):
            missing = [
                attr
                for attr in m.required_attributes()
                if _is_blank(getattr(situation, attr, None))
            ]
            if missing:
                results.append(
                    EligibilityResult(
                        program_id=m.program_id,
                        program_version=m.version,
                        state=ResultState.CANNOT_DETERMINE,
                        headline="More info needed",
                        missing_inputs=missing,
                    )
                )
                continue
            try:
                results.append(m.assess(situation))
            except Exception:
                # Honest, retryable, not the user's fault. Real impl logs the
                # exception to Lens (PII-redacted) — never to the user.
                results.append(
                    EligibilityResult(
                        program_id=m.program_id,
                        program_version=m.version,
                        state=ResultState.UNAVAILABLE,
                        headline="Temporarily unavailable",
                        reason="We couldn't complete this check right now. Please try again.",
                    )
                )
        return results
