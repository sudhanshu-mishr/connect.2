import os
import logging
from datetime import timedelta
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from . import crud, models, schemas, auth, database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables if not exist (e.g., local SQLite file creation)
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

# --- Static Files / Frontend ---
# Serve React App from 'dist' folder if it exists.

# Check current working directory and list contents for debugging on Render logs
cwd = os.getcwd()
logger.info(f"Current working directory: {cwd}")
if os.path.exists(cwd):
    logger.info(f"Directory contents: {os.listdir(cwd)}")

dist_path = os.path.join(cwd, "dist")
if os.path.exists(dist_path):
    logger.info(f"Found dist folder at {dist_path}")
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    # Serve Root
    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(dist_path, "index.html"))

    # Catch-all route for SPA
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API Endpoint Not Found")

        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    logger.warning(f"Dist folder not found at {dist_path}. Serving fallback message.")
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Conect API (Development Mode - Frontend not built). Please run 'npm run build' locally or ensure build command succeeds on deployment."}
