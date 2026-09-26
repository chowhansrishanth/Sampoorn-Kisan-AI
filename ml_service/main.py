"""Compatibility ASGI entrypoint. Production inference is defined in app.py.
Legacy synthetic crop training is never imported by this service.
"""
from app import app
