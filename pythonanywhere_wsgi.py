"""
PythonAnywhere WSGI configuration file.

Paste the contents of this file into your PythonAnywhere WSGI configuration
file (found in the Web tab → WSGI configuration file link).

Replace <yourusername> with your actual PythonAnywhere username.
"""
import os
import sys

# Add the project directory to the Python path
path = '/home/<yourusername>/websitebuilder'
if path not in sys.path:
    sys.path.insert(0, path)

# Load environment variables from .env file before Django starts
from pathlib import Path
env_file = Path(path) / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

os.environ['DJANGO_SETTINGS_MODULE'] = 'agency_showcase.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
