#!/usr/bin/python3
"""main website flask app"""
from flask import Flask, session
from views import app_views
from flask_socketio import SocketIO, join_room, leave_room, send


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
app.register_blueprint(app_views)


@socketio.on('my event')
def handle_my_custom_event(data):
    print('received json: ', data)


@socketio.on('join')
def on_join(data):
    # userId = data['username']
    userId = session['userId']
    room = data['room']
    join_room(room)
    data = {'userId': userId, 'type': 'join'}
    send(data, to=room)


@socketio.on('leave')
def on_leave(data):
    userId = data['userId']
    room = data['room']
    leave_room(room)
    send(userId + ' has left the room.', to=room)


@socketio.on('chat')
def send_chat_message(data):
    room = data['to']
    send(data, to=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)
