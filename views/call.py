#!/usr/bin/python3
"""Call module"""
from flask import render_template, g, redirect, url_for, session, request, jsonify
from views import app_views
from uuid import uuid4


@app_views.route('/call', methods=['GET', 'POST'], strict_slashes=False)
def callHandler():
    """Handles the call route"""
    # session['userId'] = str(uuid4())
    room_id = request.args.get('roomId', False)
    username = request.form.get('username')
    mute_audio = request.form.get('mute_audio')
    disable_video = request.form.get('disable_video')
    userId = session.get('userId')
    constraints = {'audio': True, 'video': True}
    if not username and not userId:
        return redirect(url_for('app_views.home'))
    elif userId and not username:
        return redirect(url_for('app_views.lobby'))
    
    if mute_audio == 'on':
        constraints['audio'] = False
    else:
        constraints['audio'] = True
    if disable_video == 'on':
        constraints['video'] = False
    else:
        constraints['video'] = True
    print('*' * 50)
    print('CONSTRAINTS', constraints)
    # Store media constraints from user
    session['constraints'] = constraints
    if room_id:
        # If required session data already exists
        if session.get('userId') and session.get('username'):
            return redirect(url_for('app_views.routeRoom', roomId=room_id))
        else:
            # Creates the re
            session['username'] = username
            session['userId'] = str(uuid4())
            return redirect(url_for('app_views.routeRoom', roomId=room_id))
    else:
        # For Initial creating room/meeting
        session['username'] = username
        session['userId'] = str(uuid4())
        room_id = str(uuid4())
        return redirect(url_for('app_views.routeRoom', roomId=room_id))


            



@app_views.route('/call/<roomId>', strict_slashes=False)
def routeRoom(roomId):
    """Routes to call html"""
    # Retreives necessary session data
    userId = session.get('userId')
    constraints = session.get('constraints')
    username = session.get('username')
    if not userId:
        # Redirect to Lobby with a query String containing roomId
        return redirect(url_for('app_views.lobby', roomId=roomId))
    # Renders the call Page
    return render_template('call.html', room_id=roomId, userId=userId, username=username, constraints=constraints)
