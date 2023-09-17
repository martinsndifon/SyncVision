#!/usr/bin/python3
"""API status module"""
from flask import render_template
from views import app_views


@app_views.route('/', strict_slashes=False)
def home():
    return render_template('index.html')
