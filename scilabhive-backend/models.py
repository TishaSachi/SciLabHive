from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ----------------------------- USERS TABLE ---------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String(10), default="user")  # user / admin
    is_admin = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    experiments = relationship(
        "Experiment",
        back_populates="user",
        cascade="all, delete"
    )



# ------------------------------------ EXPERIMENTS TABLE -----------------------------------------

class Experiment(Base):
    __tablename__ = "experiments"

    experiment_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String(100), nullable=False)
    experiment_type = Column(String(50), nullable=False)
    description = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="experiments")
    parameters = relationship(
        "ExperimentParameter",
        back_populates="experiment",
        cascade="all, delete"
    )
    results = relationship(
        "ExperimentResult",
        back_populates="experiment",
        cascade="all, delete"
    )



# --------------------------------------- EXPERIMENT PARAMETERS TABLE ---------------------------------------

class ExperimentParameter(Base):
    __tablename__ = "experiment_parameters"

    param_id = Column(Integer, primary_key=True, index=True)

    experiment_id = Column(
        Integer,
        ForeignKey("experiments.experiment_id"),
        nullable=False
    )

    param_name = Column(String(50), nullable=False)
    param_value = Column(Text)

    # Relationship
    experiment = relationship("Experiment", back_populates="parameters")



# ------------------------------------ EXPERIMENT RESULTS TABLE --------------------------------------------

class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    result_id = Column(Integer, primary_key=True, index=True)

    experiment_id = Column(
        Integer,
        ForeignKey("experiments.experiment_id"),
        nullable=False
    )

    result_name = Column(String(100), nullable=False)
    result_value = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    experiment = relationship("Experiment", back_populates="results")
