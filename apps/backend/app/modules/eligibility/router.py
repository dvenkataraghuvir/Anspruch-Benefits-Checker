from fastapi import APIRouter
from pydantic import BaseModel

from anspruch_core.types import EligibilityResult, UserSituation

from app.modules.eligibility.service import assess_situation

router = APIRouter(tags=["eligibility"])


class AssessRequest(BaseModel):
    situation: UserSituation


@router.post("/eligibility/assess", response_model=list[EligibilityResult])
def assess(req: AssessRequest) -> list[EligibilityResult]:
    # Pure deterministic call. No LLM, no fabricated numbers — the engine
    # returns CANNOT_DETERMINE / UNAVAILABLE rather than guessing.
    return assess_situation(req.situation)
