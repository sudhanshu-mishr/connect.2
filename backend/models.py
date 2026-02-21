from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime, Text
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

    profile = relationship("Profile", back_populates="user", uselist=False)
    # Specify foreign_keys for swipes to disambiguate from target_id
    swipes = relationship("Swipe", foreign_keys="[Swipe.user_id]", back_populates="user")

    matches_as_user1 = relationship("Match", foreign_keys="[Match.user1_id]", back_populates="user1")
    matches_as_user2 = relationship("Match", foreign_keys="[Match.user2_id]", back_populates="user2")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    age = Column(Integer)
    bio = Column(String)
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

    # Specify foreign_keys here as well to be safe, though User side might be enough
    user = relationship("User", foreign_keys=[user_id], back_populates="swipes")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    user1 = relationship("User", foreign_keys=[user1_id], back_populates="matches_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="matches_as_user2")
    messages = relationship("Message", back_populates="match")

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
