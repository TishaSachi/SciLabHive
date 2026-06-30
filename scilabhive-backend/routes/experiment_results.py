from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from models import Collaborator

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

    is_owner = experiment.user_id == current_user.id
    is_collab = db.query(Collaborator).filter(
        Collaborator.experiment_id == experiment_id,
        Collaborator.invite_email  == current_user.email,
        Collaborator.status        == "active",
        Collaborator.role.in_(['contributor', 'editor'])
    ).first()
    if not is_owner and not is_collab:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_result = ExperimentResult(
        result_name=result.result_name,
        result_value=result.result_value,
        result_unit=result.result_unit,
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

    is_owner = experiment.user_id == current_user.id
    is_collab = db.query(Collaborator).filter(
        Collaborator.experiment_id == experiment_id,
        Collaborator.invite_email  == current_user.email,
        Collaborator.status        == "active"
    ).first()

    if not is_owner and not is_collab:
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
        raise HTTPException(status_code=404, detail="Result not found")

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
    result.result_unit = result_data.result_unit 

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
        raise HTTPException(status_code=404, detail="Result not found")

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

@router.get("/stats", response_model=dict)
def get_results_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get all experiment IDs for this user
    experiment_ids = [
        e.experiment_id for e in 
        db.query(Experiment).filter(Experiment.user_id == current_user.id).all()
    ]
    
    # Count total results
    total_results = db.query(ExperimentResult).filter(
        ExperimentResult.experiment_id.in_(experiment_ids)
    ).count()

    return {"total_results": total_results}