from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session

from database import get_db
from models import Experiment, ExperimentResult
from schemas import (
    ExperimentResultCreate,
    ExperimentResultResponse
)
from security import get_current_user



router = APIRouter(
    prefix="/experiments",
    tags=["ExperimentResults"]
)

@router.post(
    "/{experiment_id}/results",
    response_model=ExperimentResultResponse,
    status_code=status.HTTP_201_CREATED
)
def create_experiment_result(
    experiment_id: int,
    result: ExperimentResultCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_result = ExperimentResult(
        result_name=result.result_name,
        result_value=result.result_value,
        experiment_id=experiment_id
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return new_result


@router.get(
    "/{experiment_id}/results",
    response_model=list[ExperimentResultResponse]
)
def get_experiment_results(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(ExperimentResult).filter(
        ExperimentResult.experiment_id == experiment_id
    ).all()
