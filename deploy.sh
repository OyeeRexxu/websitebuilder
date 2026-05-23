#!/bin/bash
# =============================================================================
# deploy.sh — PythonAnywhere deployment script
#
# FIRST-TIME SETUP (run once in a PythonAnywhere Bash console):
#   1. Clone the repo:
#        git clone git@github.com:OyeeRexxu/websitebuilder.git ~/websitebuilder
#   2. Create a virtualenv (PythonAnywhere dashboard → Virtualenvs, or):
#        mkvirtualenv --python=python3.12 websitebuilder
#   3. Copy and fill in your environment file:
#        cp ~/websitebuilder/.env.example ~/websitebuilder/.env
#        nano ~/websitebuilder/.env          # set SECRET_KEY, ALLOWED_HOSTS, etc.
#   4. Run this script:
#        cd ~/websitebuilder && bash deploy.sh
#   5. In the PythonAnywhere Web tab:
#        - Source code:   /home/<yourusername>/websitebuilder
#        - Working dir:   /home/<yourusername>/websitebuilder
#        - Virtualenv:    /home/<yourusername>/.virtualenvs/websitebuilder
#        - WSGI file:     point to the auto-generated file and paste the
#                         contents of pythonanywhere_wsgi.py (created below)
#
# SUBSEQUENT DEPLOYS (pull latest code and restart):
#   cd ~/websitebuilder && bash deploy.sh
# =============================================================================

set -e  # exit immediately on any error

# ---------------------------------------------------------------------------
# Configuration — adjust these to match your PythonAnywhere account
# ---------------------------------------------------------------------------
REPO_DIR="$HOME/websitebuilder"
VENV_DIR="$HOME/.virtualenvs/websitebuilder"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"
DJANGO_SETTINGS="agency_showcase.settings"

# ---------------------------------------------------------------------------
# 1. Pull latest code
# ---------------------------------------------------------------------------
echo "==> Pulling latest code..."
cd "$REPO_DIR"
git pull origin main

# ---------------------------------------------------------------------------
# 2. Install / upgrade Python dependencies
# ---------------------------------------------------------------------------
echo "==> Installing dependencies..."
"$PIP" install --upgrade pip
"$PIP" install -r requirements.txt

# ---------------------------------------------------------------------------
# 3. Apply database migrations
# ---------------------------------------------------------------------------
echo "==> Running migrations..."
"$PYTHON" manage.py migrate --noinput

# ---------------------------------------------------------------------------
# 4. Collect static files
# ---------------------------------------------------------------------------
echo "==> Collecting static files..."
"$PYTHON" manage.py collectstatic --noinput --clear

# ---------------------------------------------------------------------------
# 5. Reload the PythonAnywhere web app
#    Uses the PA API via the `pa` CLI tool (pre-installed on PythonAnywhere).
#    If pa is not available, touch the WSGI file to trigger a reload instead.
# ---------------------------------------------------------------------------
echo "==> Reloading web app..."
if command -v pa &>/dev/null; then
    pa website reload "$(whoami).pythonanywhere.com" || true
else
    # Fallback: touching the WSGI file triggers an automatic reload on PA
    touch /var/www/"$(whoami)"_pythonanywhere_com_wsgi.py 2>/dev/null || \
        echo "  (Could not touch WSGI file — reload the web app manually in the PA dashboard)"
fi

echo ""
echo "==> Deploy complete!"
echo "    Visit: https://$(whoami).pythonanywhere.com"
