# The Poetic Majlis · المجلس الشعري
# Run `just` to see available recipes.

default:
    @just --list

# Install all dependencies (Python + Node)
install:
    cd apps/api && pip install -q -r requirements.txt
    cd apps/web && npm install --no-audit --no-fund

# Start the FastAPI backend on port 8000
api:
    cd apps/api && uvicorn main:app --reload --port 8000

# Start the Next.js frontend on port 3000
web:
    cd apps/web && npm run dev

# Run backend + frontend together (requires two terminals — use tmux or run.sh)
dev:
    @echo "Starting backend in background..."
    cd apps/api && uvicorn main:app --reload --port 8000 &
    @sleep 2
    @echo "Starting frontend..."
    cd apps/web && npm run dev

# Check API health
health:
    curl -s http://127.0.0.1:8000/api/health | python3 -m json.tool

# Run Python data scripts
seed:
    cd scripts && python3 seed_dct_ousha.py

crawl:
    cd scripts && python3 dct_crawler.py

parse:
    cd scripts && python3 dct_parse.py

tsne:
    cd scripts && python3 build_tsne_map.py

# Lint frontend
lint:
    cd apps/web && npm run lint

# Build frontend for production
build:
    cd apps/web && npm run build

# Remove generated artifacts
clean:
    rm -f apps/api/majlis.db
    rm -rf apps/web/.next
    rm -rf apps/web/node_modules/.cache
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
