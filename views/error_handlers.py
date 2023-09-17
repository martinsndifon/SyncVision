#!/usr/bin/python3
"""Module to handle all errors"""
from flask import render_template
from views import app_views


@app_views.route('/expired', strict_slashes=False)
def room_nonexistent():
    """Return page to tell users the meeting has ended"""
    return render_template('meeting_ended.html')


@app_views.route('/max-capacity', strict_slashes=False)
def room_at_maxcapacity():
    """Return page to tell users the meeting is at max capacity"""
    return render_template('max-capacity.html')
