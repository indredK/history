#!/bin/bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PID=""
FRONTEND_PID=""
CLEANUP_DONE=0

echo "🚀 Starting development servers..."

cleanup() {
    if [ "$CLEANUP_DONE" -eq 1 ]; then
        return
    fi

    CLEANUP_DONE=1
    echo "🛑 Stopping development servers..."

    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
    fi

    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
}

fail() {
    echo "❌ $1"
    exit 1
}

wait_for_startup() {
    local pid="$1"
    local name="$2"

    sleep 2

    if ! kill -0 "$pid" 2>/dev/null; then
        wait "$pid"
        local exit_code=$?
        fail "$name failed to start (exit code $exit_code)."
    fi
}

monitor_processes() {
    while true; do
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            wait "$BACKEND_PID"
            local exit_code=$?
            fail "Backend exited unexpectedly (exit code $exit_code)."
        fi

        if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            wait "$FRONTEND_PID"
            local exit_code=$?
            fail "Frontend exited unexpectedly (exit code $exit_code)."
        fi

        sleep 1
    done
}

trap cleanup EXIT SIGINT SIGTERM

echo "🔎 Verifying workspace tooling..."
(cd "$ROOT_DIR" && bun run verify:tooling) || fail "Dependency check failed."

echo "📦 Starting backend server..."
(cd "$ROOT_DIR" && bun run dev:backend) &
BACKEND_PID=$!
wait_for_startup "$BACKEND_PID" "Backend"

echo "🎨 Starting frontend server..."
(cd "$ROOT_DIR" && bun run dev:frontend) &
FRONTEND_PID=$!
wait_for_startup "$FRONTEND_PID" "Frontend"

echo "✅ Development servers started!"
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

monitor_processes
