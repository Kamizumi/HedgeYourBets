"""
WSGI config for hedge_bets project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hedge_bets.settings')

application = get_wsgi_application()
