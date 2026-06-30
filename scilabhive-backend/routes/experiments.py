from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import Experiment
from schemas import ExperimentCreate, ExperimentResponse
from security import get_current_user
from models import Collaborator

router = APIRouter(
    prefix="/experiments",
    tags=["Experiments"]
)


#  ------------------------------------- CREATE experiment ---------------------------

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
        status=experiment.status,
        user_id=current_user.id
    )

    db.add(new_experiment)
    db.commit()
    db.refresh(new_experiment)

    return new_experiment


# ----------------------------------- GET my experiments -------------------------------------

@router.get("/", response_model=list[ExperimentResponse])
def get_experiments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get own experiments
    own = db.query(Experiment).filter(
        Experiment.user_id == current_user.id
    ).all()

    # Get experiments shared with this user as collaborator
    collab_exp_ids = [
        c.experiment_id for c in
        db.query(Collaborator).filter(
            Collaborator.invite_email == current_user.email,
            Collaborator.status == "active"
        ).all()
    ]
    shared = db.query(Experiment).filter(
        Experiment.experiment_id.in_(collab_exp_ids)
    ).all() if collab_exp_ids else []

    return own + shared

# ---------------------------------- update the experiment -------------------------------

@router.put("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: int,
    data: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    role = get_user_role_for_experiment(
        experiment_id, current_user.id, current_user.email, db
    )

    print(f"DEBUG → experiment_id={experiment_id}, current_user.id={current_user.id}, role={role}")

    if role not in ('owner', 'editor'):
        raise HTTPException(status_code=403, detail="Not authorized")

    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id
    ).first()
    experiment.title           = data.title
    experiment.experiment_type = data.experiment_type
    experiment.status          = data.status
    experiment.description     = data.description
    experiment.updated_at      = datetime.now(timezone.utc)
    db.commit()
    db.refresh(experiment)
    return experiment


# ---------------------------------------- Delete the experiment ------------------------
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


# ---------------- Get user roles ------------------------



def get_user_role_for_experiment(experiment_id, user_id, user_email, db):
    """Returns 'owner', 'editor', 'contributor', 'viewer', or None"""
    exp = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id
    ).first()
    if not exp:
        return None
    if exp.user_id == user_id:
        return 'owner'
    collab = db.query(Collaborator).filter(
        Collaborator.experiment_id == experiment_id,
        Collaborator.invite_email == user_email,
        Collaborator.status == "active"
    ).first()
    return collab.role if collab else None