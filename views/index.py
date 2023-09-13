#!/usr/bin/python3
"""API status module"""

from views import app_views


@app_views.route('/', strict_slashes=False)
def home():
    return "Hello there, welcome to Syncvision"
