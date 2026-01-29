from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Experiment
from schemas import ExperimentCreate, ExperimentResponse
from security import get_current_user

router = APIRouter(
    prefix="/experiments",
    tags=["Experiments"]
)

# -------------------------
# CREATE experiment
# -------------------------
@router.post("/", response_model=ExperimentResponse)
def create_experiment(
    experiment: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_experiment = Experiment(
        title=experiment.title,
        experiment_type=experiment.experiment_type,
        description=experiment.description,
        user_id=current_user.id
    )

    db.add(new_experiment)
    db.commit()
    db.refresh(new_experiment)

    return new_experiment


# -------------------------
# GET my experiments
# -------------------------
@router.get("/", response_model=list[ExperimentResponse])
def get_my_experiments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Experiment).filter(
        Experiment.user_id == current_user.id
    ).all()

# --------- update the experiment -------------------------------

@router.put("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    updated_data: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    experiment.title = updated_data.title
    experiment.experiment_type = updated_data.experiment_type
    experiment.description = updated_data.description

    db.commit()
    db.refresh(experiment)

    return experiment


# ------------------- Delete the experiment ------------------------
@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    db.delete(experiment)
    db.commit()

    return

