#!/usr/bin/python3
"""API status module"""
from flask import render_template, request, send_file
from views import app_views

# Serves the open graph image
@app_views.route('/ogi.png')
def serve_og_image():
    image_data = open('static/images/ogi.png', 'rb')
    return send_file(image_data, mimetype='image/png')

@app_views.route('/', strict_slashes=False)
def home():
    """Handle Home page route"""
    return render_template('index.html')

@app_views.route('/call/lobby', strict_slashes=False)
def lobby():
    """Handle Lobby page route"""
    roomId = request.args.get('roomId')
    return render_template('lobby.html', roomId=roomId)

@app_views.route('/about', strict_slashes=False)
def about():
    """Handle About page route"""
    return render_template('about.html')