from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime

from . import models, schemas
# auth imported below to avoid circular

# User CRUD
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

# Profile CRUD
def get_user_profile(db: Session, user_id: int):
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

def create_user_profile(db: Session, profile: schemas.ProfileCreate, user_id: int):
    db_profile = models.Profile(**profile.dict(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

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

# Discovery CRUD
def get_potential_matches(db: Session, user_id: int, limit: int = 10, gender_filter: Optional[str] = None):
    # 1. Users already swiped
    swiped_rows = db.query(models.Swipe.target_id).filter(models.Swipe.user_id == user_id).all()
    swiped_ids = [row[0] for row in swiped_rows]

    # 2. Users blocked by current user
    blocked_rows = db.query(models.Block.blocked_id).filter(models.Block.blocker_id == user_id).all()
    blocked_ids = [row[0] for row in blocked_rows]

    # 3. Users who blocked current user (reciprocal safety)
    blocked_by_rows = db.query(models.Block.blocker_id).filter(models.Block.blocked_id == user_id).all()
    blocker_ids = [row[0] for row in blocked_by_rows]

    exclude_ids = list(set(swiped_ids + blocked_ids + blocker_ids + [user_id]))

    query = db.query(models.User).join(models.Profile).filter(models.User.id.notin_(exclude_ids))

    # Apply filters
    if gender_filter:
        query = query.filter(models.Profile.gender == gender_filter)

    potential_users = query.limit(limit).all()

    profiles = []
    for user in potential_users:
        if user.profile:
            profiles.append(user.profile)
    return profiles

# Swipe CRUD
def create_swipe(db: Session, swipe: schemas.SwipeCreate, user_id: int):
    # Check if already swiped
    existing = db.query(models.Swipe).filter(
        models.Swipe.user_id == user_id,
        models.Swipe.target_id == swipe.target_id
    ).first()

    if existing:
        return {"is_match": False} # Already swiped, ignore

    db_swipe = models.Swipe(user_id=user_id, target_id=swipe.target_id, is_like=swipe.is_like)
    db.add(db_swipe)
    db.commit()

    is_match = False
    if swipe.is_like:
        # Check if target also liked user
        other_swipe = db.query(models.Swipe).filter(
            models.Swipe.user_id == swipe.target_id,
            models.Swipe.target_id == user_id,
            models.Swipe.is_like == True
        ).first()

        if other_swipe:
            # Create Match
            match_exists = db.query(models.Match).filter(
                or_(
                    and_(models.Match.user1_id == user_id, models.Match.user2_id == swipe.target_id),
                    and_(models.Match.user1_id == swipe.target_id, models.Match.user2_id == user_id)
                )
            ).first()

            if not match_exists:
                is_match = True
                match = models.Match(user1_id=min(user_id, swipe.target_id), user2_id=max(user_id, swipe.target_id), timestamp=datetime.utcnow())
                db.add(match)
                db.commit()

    return {"is_match": is_match}

# Match CRUD
def get_matches_for_user(db: Session, user_id: int):
    # Eager load users to avoid N+1 queries later if possible, though we need logic to pick the "other" one.
    matches = db.query(models.Match).options(
        joinedload(models.Match.user1).joinedload(models.User.profile),
        joinedload(models.Match.user2).joinedload(models.User.profile)
    ).filter(
        or_(models.Match.user1_id == user_id, models.Match.user2_id == user_id)
    ).order_by(models.Match.timestamp.desc()).all()

    result = []
    for match in matches:
        other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id

        # Determine the other user object
        if match.user1_id == other_user_id:
            other_user = match.user1
        else:
            other_user = match.user2

        if not other_user:
            continue

        # Check block (can optimize by filtering in main query but complex with OR)
        block_exists = db.query(models.Block).filter(
            or_(
                and_(models.Block.blocker_id == user_id, models.Block.blocked_id == other_user_id),
                and_(models.Block.blocker_id == other_user_id, models.Block.blocked_id == user_id)
            )
        ).first()
        if block_exists:
            continue

        last_message = db.query(models.Message).filter(models.Message.match_id == match.id).order_by(models.Message.timestamp.desc()).first()
        unread_count = db.query(models.Message).filter(
            models.Message.match_id == match.id,
            models.Message.sender_id != user_id,
            models.Message.is_read == False
        ).count()

        result.append({
            "id": match.id,
            "user": other_user,
            "last_message": last_message,
            "unread_count": unread_count,
            "timestamp": match.timestamp or datetime.utcnow()
        })

    return result

def get_messages(db: Session, match_id: int, limit: int = 50):
    return db.query(models.Message).filter(models.Message.match_id == match_id).order_by(models.Message.timestamp.asc()).limit(limit).all()

def create_message(db: Session, message: schemas.MessageCreate, user_id: int, match_id: int):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        return None
    if match.user1_id != user_id and match.user2_id != user_id:
        return None

    db_message = models.Message(
        match_id=match_id,
        sender_id=user_id,
        text=message.text
    )
    db.add(db_message)

    match.timestamp = db_message.timestamp
    db.add(match)

    db.commit()
    db.refresh(db_message)

    return db_message

# Safety CRUD
def create_report(db: Session, report: schemas.ReportCreate, reporter_id: int):
    db_report = models.Report(reporter_id=reporter_id, reported_id=report.reported_id, reason=report.reason)
    db.add(db_report)
    db.commit()
    return db_report

def create_block(db: Session, block: schemas.BlockCreate, blocker_id: int):
    db_block = models.Block(blocker_id=blocker_id, blocked_id=block.blocked_id)
    db.add(db_block)

    match = db.query(models.Match).filter(
        or_(
            and_(models.Match.user1_id == blocker_id, models.Match.user2_id == block.blocked_id),
            and_(models.Match.user1_id == block.blocked_id, models.Match.user2_id == blocker_id)
        )
    ).first()

    if match:
        db.delete(match)

    db.commit()
    return db_block

def unmatch_user(db: Session, match_id: int, user_id: int):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if match and (match.user1_id == user_id or match.user2_id == user_id):
        db.delete(match)
        db.commit()
        return True
    return False
