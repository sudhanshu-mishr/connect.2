from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_onboarded = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="user", uselist=False)

    # Relationships
    swipes = relationship("Swipe", foreign_keys="[Swipe.user_id]", back_populates="user")
    matches_as_user1 = relationship("Match", foreign_keys="[Match.user1_id]", back_populates="user1")
    matches_as_user2 = relationship("Match", foreign_keys="[Match.user2_id]", back_populates="user2")

    # Safety
    reports_made = relationship("Report", foreign_keys="[Report.reporter_id]", back_populates="reporter")
    blocks_made = relationship("Block", foreign_keys="[Block.blocker_id]", back_populates="blocker")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Basic
    name = Column(String)
    age = Column(Integer)
    bio = Column(String)

    # Identity & Lifestyle
    gender = Column(String, nullable=True) # Man, Woman, Non-binary, etc.
    orientation = Column(String, nullable=True) # Straight, Gay, Bi, etc.
    relationship_goals = Column(String, nullable=True) # Long-term, Casual, etc.
    lifestyle_badges = Column(JSON, default=list) # ["Smoker", "Drinker", "Pets"]

    # Professional
    job_title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    school = Column(String, nullable=True)

    # Location
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)

    # Media & Tags
    images = Column(JSON, default=list)
    interests = Column(JSON, default=list)

    user = relationship("User", back_populates="profile")

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_id = Column(Integer, ForeignKey("users.id"))
    is_like = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="swipes")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    user1 = relationship("User", foreign_keys=[user1_id], back_populates="matches_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="matches_as_user2")
    messages = relationship("Message", back_populates="match", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    match = relationship("Match", back_populates="messages")
    sender = relationship("User")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reported_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports_made")

class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(Integer, ForeignKey("users.id"))
    blocked_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    blocker = relationship("User", foreign_keys=[blocker_id], back_populates="blocks_made")
