from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session

from database import get_db
from models import Experiment, ExperimentParameter
from schemas import (
    ExperimentParameterCreate,
    ExperimentParameterResponse
)
from security import get_current_user



router = APIRouter(
    prefix="/experiment_param",
    tags=["ExperimentParameters"]
)


# -------------- Create Experimment Parameter -------------

@router.post(
    "/{experiment_id}/parameters",
    response_model=ExperimentParameterResponse
)
def create_experiment_parameter(
    experiment_id: int,
    param: ExperimentParameterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1️⃣ Get experiment
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == experiment_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # 2️⃣ Ownership check
    if experiment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 3️⃣ Create parameter
    new_param = ExperimentParameter(
        param_name=param.param_name,
        param_value=param.param_value,
        experiment_id=experiment_id
    )

    db.add(new_param)
    db.commit()
    db.refresh(new_param)

    return new_param


# ------------------------------------ GET experiments parameters ------------------------------------

@router.get(
    "/{experiment_id}/parameters",
    response_model=list[ExperimentParameterResponse]
)
def get_experiment_parameters(
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

    return experiment.parameters


# --------------- Update Experiment Parameters ------------------
    
@router.put("/{param_id}", response_model=ExperimentParameterResponse)
def update_experiment_param(
    param_id: int,
    param_data: ExperimentParameterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get parameter
    parameter = db.query(ExperimentParameter).filter(
        ExperimentParameter.param_id == param_id
    ).first()

    if not parameter:
        raise HTTPException(status_code=404, detail="Parameter not found")

    # Ownership check via experiment
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == parameter.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update fields
    parameter.param_name = param_data.param_name
    parameter.param_value = param_data.param_value

    db.commit()
    db.refresh(parameter)

    return parameter

# ---------------------------- Delete Experiment Parameters -------------------------

@router.delete("/{param_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment_parameter(
    param_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    parameter = db.query(ExperimentParameter).filter(
        ExperimentParameter.param_id == param_id
    ).first()

    if not parameter:
        raise HTTPException(status_code=404, detail="Parameter not found")

    # Ownership check
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == parameter.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(parameter)
    db.commit()

    return
