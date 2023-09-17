#!/usr/bin/python3
"""Call module"""
from flask import render_template, g, redirect, url_for, session, request
from views import app_views
from uuid import uuid4


@app_views.route('/call', strict_slashes=False)
def callHandler():
    """Handles the call route"""
    # session['userId'] = str(uuid4())
    room_id = str(uuid4())
    return redirect(url_for('app_views.routeRoom', roomId=room_id))


@app_views.route('/call/<roomId>', strict_slashes=False)
def routeRoom(roomId):
    """Routes to call html"""
    if not session.get('userId'):
        session['userId'] = str(uuid4())
        return render_template('lobby.html')
    userId = session.get('userId')
    username = session.get('username')
    return render_template('call.html', room_id=roomId, userId=userId, username=username)


@app_views.route('/call/lobby', strict_slashes=False)
def lobby():
    """Handles the formdata from the lobby"""
    username = request.form.get('username')
    session['username'] = username
    return redirect(url_for('app_views.callHandler'))
