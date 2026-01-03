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
