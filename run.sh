#!/usr/bin/env bash
# Launch the Poetic Majlis — backend + frontend in two terminals.
# Usage: ./run.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "═══════════════════════════════════════════════════════════════"
echo "  The Poetic Majlis · المجلس الشعري"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Backend ──────────────────────────────────────────────────────
echo "→ Backend deps"
cd "$ROOT/apps/api"
pip install -q -r requirements.txt
echo "→ Booting FastAPI on http://127.0.0.1:8000"
(uvicorn main:app --reload --port 8000 &)
API_PID=$!
sleep 2

# ── Frontend ─────────────────────────────────────────────────────
echo "→ Frontend deps"
cd "$ROOT/apps/web"
if [ ! -d node_modules ]; then npm install --no-audit --no-fund; fi
echo ""
echo "→ Booting Next.js on http://localhost:3000"
echo ""
echo "  Open  →  http://localhost:3000"
echo ""
npm run dev
