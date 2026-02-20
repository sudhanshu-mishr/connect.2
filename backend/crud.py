from sqlalchemy.orm import Session
from . import models, schemas
# auth is imported inside functions to avoid circular dependency

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    from . import auth
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_profile(db: Session, profile: schemas.ProfileCreate, user_id: int):
    db_profile = models.Profile(**profile.dict(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_user_profile(db: Session, user_id: int):
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

def update_user_profile(db: Session, profile: schemas.ProfileUpdate, user_id: int):
    db_profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not db_profile:
        return create_user_profile(db, profile, user_id)

    profile_data = profile.dict(exclude_unset=True)
    for key, value in profile_data.items():
        setattr(db_profile, key, value)

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def set_user_onboarded(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.is_onboarded = True
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user
