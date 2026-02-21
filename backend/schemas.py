from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProfileBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    orientation: Optional[str] = None
    relationship_goals: Optional[str] = None
    lifestyle_badges: List[str] = []
    job_title: Optional[str] = None
    company: Optional[str] = None
    school: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    images: List[str] = []
    interests: List[str] = []

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_onboarded: bool
    is_verified: bool
    is_admin: bool
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

# --- New Schemas ---

class SwipeCreate(BaseModel):
    target_id: int
    is_like: bool

class SwipeResponse(BaseModel):
    is_match: bool

class MessageBase(BaseModel):
    text: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: int
    user: UserResponse
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    timestamp: datetime

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    reported_id: int
    reason: str

class BlockCreate(BaseModel):
    blocked_id: int
