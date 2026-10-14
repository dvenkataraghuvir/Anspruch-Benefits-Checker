"""Engine guarantees that hold regardless of any benefit's figures."""
from __future__ import annotations

from datetime import date

import pytest

from anspruch_core.types import (
    EligibilityResult,
    Money,
    ResultState,
    UserSituation,
)
from rules_engine.engine import EligibilityEngine


class _OkModule:
    program_id = "ok"
    version = "1"
    effective_from = date(2020, 1, 1)
    effective_to = None

    def required_attributes(self):
        return ["bundesland"]

    def assess(self, s):
        return EligibilityResult(
            program_id="ok",
            program_version="1",
            state=ResultState.ELIGIBLE,
            headline="ok",
            estimated_amount=Money(amount="100"),
        )


class _BoomModule(_OkModule):
    program_id = "boom"

    def assess(self, s):
        raise RuntimeError("calculator blew up")


class _FutureModule(_OkModule):
    program_id = "future"
    effective_from = date(2099, 1, 1)


def _situation(**kw) -> UserSituation:
    base = dict(as_of=date(2026, 6, 1), bundesland="Bayern")
    base.update(kw)
    return UserSituation(**base)


def test_missing_input_yields_cannot_determine():
    engine = EligibilityEngine([_OkModule()])
    [res] = engine.assess_all(_situation(bundesland=None))
    assert res.state is ResultState.CANNOT_DETERMINE
    assert res.missing_inputs == ["bundesland"]


def test_present_input_runs_module():
    engine = EligibilityEngine([_OkModule()])
    [res] = engine.assess_all(_situation())
    assert res.state is ResultState.ELIGIBLE
    assert res.estimated_amount.amount == 100


def test_module_exception_becomes_unavailable():
    engine = EligibilityEngine([_BoomModule()])
    [res] = engine.assess_all(_situation())
    assert res.state is ResultState.UNAVAILABLE  # never leaks the exception


def test_inactive_module_is_skipped_by_date():
    engine = EligibilityEngine([_FutureModule()])
    assert engine.assess_all(_situation()) == []


def test_eligible_without_amount_is_rejected_by_contract():
    # The contract must make a contradictory result impossible to construct.
    with pytest.raises(ValueError):
        EligibilityResult(
            program_id="x",
            program_version="1",
            state=ResultState.ELIGIBLE,
            headline="x",
            estimated_amount=None,
        )
