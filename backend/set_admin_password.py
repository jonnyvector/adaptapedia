#!/usr/bin/env python
"""Quick script to generate password hash for admin user."""

from django.contrib.auth.hashers import make_password

password = "adaptapedia2025!"
hashed = make_password(password)
print(hashed)
