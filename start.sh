#!/bin/bash
set -e
npm install
npm run build
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
