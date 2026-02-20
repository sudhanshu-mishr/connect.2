from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas, auth, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*", # For development, we can allow all, but for prod restrict this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Conect API"}

@app.post("/auth/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.email)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Fetch profile if exists
    profile = crud.get_user_profile(db, current_user.id)
    current_user.profile = profile
    return current_user

@app.post("/users/me/onboard", response_model=schemas.ProfileResponse)
def onboard_user(
    profile: schemas.ProfileCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Create or update profile
    db_profile = crud.update_user_profile(db, profile, current_user.id)
    # Set user as onboarded
    crud.set_user_onboarded(db, current_user.id)
    return db_profile

@app.get("/health")
def health_check():
    return {"status": "ok"}
