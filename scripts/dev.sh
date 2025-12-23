#!/bin/bash

# Start both frontend and backend in development mode
echo "🚀 Starting development servers..."

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend with Node.js
echo "📦 Starting backend server..."
(cd backend && ./node_modules/.bin/nest start --watch) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend with Bun
echo "🎨 Starting frontend server..."
(cd frontend && bun run dev) &
FRONTEND_PID=$!

# Wait for both processes
echo "✅ Development servers started!"
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

wait