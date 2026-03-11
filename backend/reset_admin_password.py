"""
Reset admin password to 'admin123'
Usage: python reset_admin_password.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hedge_bets.settings')
django.setup()

from django.contrib.auth.models import User

try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print("[SUCCESS] Admin password reset successfully!")
    print()
    print("Login credentials:")
    print("  Username: admin")
    print("  Password: admin123")
    print()
    print("To access admin panel:")
    print("  1. Run: python manage.py runserver")
    print("  2. Visit: http://localhost:8000/admin")
except User.DoesNotExist:
    print("[ERROR] Admin user not found!")

