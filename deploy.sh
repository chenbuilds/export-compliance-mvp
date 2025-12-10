#!/bin/bash

echo "🚀 Starting Export Compliance Assistant Deployment..."

# 1. Backend Setup
echo "🔹 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Start Backend in background
echo "🔹 Starting Backend Server..."
# Using gunicorn for production-like feel, or python for simplicity
if command -v gunicorn &> /dev/null; then
    gunicorn app:app --daemon --bind 0.0.0.0:5001
else
    nohup python3 app.py > backend.log 2>&1 &
fi
BACKEND_PID=$!
echo "✅ Backend started on port 5001"
cd ..

# 2. Frontend Setup
echo "🔹 Setting up Frontend..."
npm install
echo "🔹 Building Frontend..."
npm run build

echo "🔹 Serving Frontend..."
# Use 'serve' to serve static build
if ! command -v serve &> /dev/null; then
    echo "Installing 'serve' package..."
    npm install -g serve
fi

echo "✅ App Deployed locally!"
echo "🌍 Access at: http://localhost:3000"
serve -s dist -l 3000 --single

# Cleanup on exit
kill $BACKEND_PID
