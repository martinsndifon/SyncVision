#!/usr/bin/python3
"""Call module"""
from flask import render_template, g, redirect, url_for
from views import app_views
from uuid import uuid4

@app_views.route('/call', strict_slashes=False)
def callHandler():
    """Handles the call route"""
    room_id = str(uuid4())
    return redirect('/call/{}'.format(room_id))

@app_views.route('/call/<roomId>', strict_slashes=False)
def routeRoom(roomId):
    """Routes to call html"""
    return render_template('call.html', room_id=roomId)
