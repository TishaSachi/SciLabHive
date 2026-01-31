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
    prefix="/experiment_results",
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


# --------------- Update Experiment Results ------------------
    
@router.put("/{result_id}", response_model=ExperimentResultResponse)
def update_experiment_result(
    result_id: int,
    result_data: ExperimentResultCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get parameter
    result = db.query(ExperimentResult).filter(
        ExperimentResult.result_id == result_id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Parameter not found")

    # Ownership check via experiment
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == result.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update fields
    result.result_name = result_data.result_name
    result.result_value = result_data.result_value

    db.commit()
    db.refresh(result)

    return result

# ---------------------------- Delete Experiment Parameters -------------------------

@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    result = db.query(ExperimentResult).filter(
        ExperimentResult.result_id == result_id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Parameter not found")

    # Ownership check
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == result.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(result)
    db.commit()

    return