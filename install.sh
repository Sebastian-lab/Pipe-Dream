#!/usr/bin/env bash
set -euo pipefail

# Use python3 on macOS
PYTHON_BIN="${PYTHON_BIN:-python3}"

# Create venv if it doesn't exist
if [ ! -d ".venv" ]; then
  "$PYTHON_BIN" -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Upgrade pip first
python -m pip install --upgrade pip

# Then upgrade packaging tools
python -m pip install --upgrade setuptools wheel

# Install deps
python -m pip install -r requirements.txt

echo "Done. Virtualenv: .venv"
echo "To run: source .venv/bin/activate && uvicorn main:app --reload"