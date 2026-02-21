import os
import logging
from datetime import timedelta, datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from . import crud, models, schemas, auth, database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables if not exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routes ---

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/auth/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/auth/login", response_model=schemas.Token)
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

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    profile = crud.get_user_profile(db, current_user.id)
    current_user.profile = profile
    return current_user

@app.post("/api/users/me/onboard", response_model=schemas.ProfileResponse)
def onboard_user(
    profile: schemas.ProfileCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_profile = crud.update_user_profile(db, profile, current_user.id)
    crud.set_user_onboarded(db, current_user.id)
    return db_profile

@app.put("/api/users/me/profile", response_model=schemas.ProfileResponse)
def update_profile(
    profile: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.update_user_profile(db, profile, current_user.id)

@app.get("/api/users/discovery", response_model=List[schemas.ProfileResponse])
def get_discovery_profiles(
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.get_potential_matches(db, current_user.id, limit)

@app.post("/api/swipes", response_model=schemas.SwipeResponse)
def create_swipe(
    swipe: schemas.SwipeCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.create_swipe(db, swipe, current_user.id)

@app.get("/api/matches", response_model=List[schemas.MatchResponse])
def get_matches(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    matches = crud.get_matches_for_user(db, current_user.id)
    # The CRUD returns a list of dicts that matches the MatchResponse schema
    return matches

@app.get("/api/matches/{match_id}/messages", response_model=List[schemas.MessageResponse])
def get_messages(
    match_id: int,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Security check: verify user is in match (handled in CRUD properly or here)
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match or (match.user1_id != current_user.id and match.user2_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    return crud.get_messages(db, match_id, limit)

@app.post("/api/matches/{match_id}/messages", response_model=schemas.MessageResponse)
def create_message(
    match_id: int,
    message: schemas.MessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_message = crud.create_message(db, message, current_user.id, match_id)
    if not db_message:
        raise HTTPException(status_code=400, detail="Failed to send message")
    return db_message

# --- Static Files / Frontend ---
cwd = os.getcwd()
dist_path = os.path.join(cwd, "dist")
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(dist_path, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API Endpoint Not Found")

        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Conect API (Development Mode - Frontend not built). Please run 'npm run build' locally."}
