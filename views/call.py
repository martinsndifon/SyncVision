#!/usr/bin/python3
"""Call module"""
from flask import render_template, g, redirect, url_for, session
from views import app_views
from uuid import uuid4


@app_views.route('/call', strict_slashes=False)
def callHandler():
    """Handles the call route"""
    # session['userId'] = str(uuid4())
    room_id = str(uuid4())
    return redirect('/call/{}'.format(room_id))

@app_views.route('/call/<roomId>', strict_slashes=False)
def routeRoom(roomId):
    """Routes to call html"""
    session['userId'] = str(uuid4())
    userId = session.get('userId')
    return render_template('call.html', room_id=roomId, userId=userId)
