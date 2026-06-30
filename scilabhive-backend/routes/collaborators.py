from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import Collaborator, User, Experiment
from schemas import CollaboratorInvite, CollaboratorResponse, CollaboratorWithUser
from security import get_current_user
from email_service import send_invite_email

router = APIRouter(
    prefix="/collaborators",
    tags=["Collaborators"]
)


# ── Invite a collaborator ──
@router.post("/invite", response_model=CollaboratorResponse, status_code=201)
async def invite_collaborator(
    data: CollaboratorInvite,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    print(f"DEBUG → experiment_id={data.experiment_id} (type={type(data.experiment_id)}), current_user.id={current_user.id}, email={data.invite_email}")

    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == data.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    print(f"DEBUG → experiment found: {experiment}")

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Check experiment belongs to current user
    experiment = db.query(Experiment).filter(
        Experiment.experiment_id == data.experiment_id,
        Experiment.user_id == current_user.id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Check not already invited
    existing = db.query(Collaborator).filter(
        Collaborator.experiment_id == data.experiment_id,
        Collaborator.invite_email  == data.invite_email,
        Collaborator.status        != "declined"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already invited")

    # Check if invitee already has an account
    invitee = db.query(User).filter(User.email == data.invite_email).first()

    new_collab = Collaborator(
        experiment_id   = data.experiment_id,
        owner_id        = current_user.id,
        collaborator_id = invitee.id if invitee else None,
        invite_email    = data.invite_email,
        role            = data.role,
        status          = "pending",
    )

    db.add(new_collab)
    db.commit()
    db.refresh(new_collab)

    # Send invite email
    await send_invite_email(
        email           = data.invite_email,
        inviter_name    = current_user.full_name,
        experiment_title= experiment.title,
        role            = data.role,
        invite_id       = new_collab.id,
    )

    return new_collab


# ── Get all collaborators for current user's experiments ──
@router.get("/my", response_model=list[CollaboratorWithUser])
def get_my_collaborators(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    collabs = db.query(Collaborator).filter(
        Collaborator.owner_id == current_user.id
    ).all()

    result = []
    for c in collabs:
        user = db.query(User).filter(User.id == c.collaborator_id).first() if c.collaborator_id else None
        exp  = db.query(Experiment).filter(Experiment.experiment_id == c.experiment_id).first()
        result.append(CollaboratorWithUser(
            id                 = c.id,
            experiment_id      = c.experiment_id,
            invite_email       = c.invite_email,
            role               = c.role,
            status             = c.status,
            invited_at         = c.invited_at,
            accepted_at        = c.accepted_at,
            collaborator_id    = c.collaborator_id,
            collaborator_name  = user.full_name  if user else None,
            collaborator_email = user.email       if user else c.invite_email,
            experiment_title   = exp.title        if exp  else None,
        ))
    return result


# ── Get invitations sent TO current user ──
@router.get("/invitations", response_model=list[CollaboratorWithUser])
def get_my_invitations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    collabs = db.query(Collaborator).filter(
        Collaborator.invite_email == current_user.email,
        Collaborator.status       == "pending"
    ).all()

    result = []
    for c in collabs:
        owner = db.query(User).filter(User.id == c.owner_id).first()
        exp   = db.query(Experiment).filter(Experiment.experiment_id == c.experiment_id).first()
        result.append(CollaboratorWithUser(
            id                 = c.id,
            experiment_id      = c.experiment_id,
            invite_email       = c.invite_email,
            role               = c.role,
            status             = c.status,
            invited_at         = c.invited_at,
            accepted_at        = c.accepted_at,
            collaborator_id    = c.collaborator_id,
            collaborator_name  = owner.full_name if owner else None,
            collaborator_email = owner.email      if owner else None,
            experiment_title   = exp.title        if exp   else None,
        ))
    return result


# ── Accept invitation ──
@router.put("/{invite_id}/accept", response_model=CollaboratorResponse)
def accept_invitation(
    invite_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    collab = db.query(Collaborator).filter(
        Collaborator.id           == invite_id,
        Collaborator.invite_email == current_user.email,
        Collaborator.status       == "pending"
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Invitation not found")

    collab.status          = "active"
    collab.collaborator_id = current_user.id
    collab.accepted_at     = datetime.now(timezone.utc)
    db.commit()
    db.refresh(collab)
    return collab


# ── Decline invitation ──
@router.put("/{invite_id}/decline", response_model=CollaboratorResponse)
def decline_invitation(
    invite_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    collab = db.query(Collaborator).filter(
        Collaborator.id           == invite_id,
        Collaborator.invite_email == current_user.email,
        Collaborator.status       == "pending"
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Invitation not found")

    collab.status = "declined"
    db.commit()
    db.refresh(collab)
    return collab


# ── Remove collaborator (owner only) ──
@router.delete("/{collab_id}", status_code=204)
def remove_collaborator(
    collab_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    collab = db.query(Collaborator).filter(
        Collaborator.id       == collab_id,
        Collaborator.owner_id == current_user.id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Collaborator not found")

    db.delete(collab)
    db.commit()
    return