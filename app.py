#!/usr/bin/python3
"""main website flask app"""
from flask import Flask, session, request
from views import app_views
from flask_socketio import SocketIO, join_room, leave_room, send, emit


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
app.register_blueprint(app_views)


@socketio.on('my event')
def handle_my_custom_event(data):
    print('received json: ', data)


# Track connected users in each room
room_users = {}
clients = {}


@socketio.on('join')
def on_join(data):
    userId = session['userId']
    room = data['room']
    join_room(room)
    if room not in room_users:
        room_users[room] = []
    room_users[room].append(userId)

    if room not in clients:
        clients[room] = {}
    if userId not in clients[room]:
        clients[room][userId] = request.sid  # type: ignore

    data = {'userId': userId, 'type': 'join'}
    send(data, to=room)
    emit('ready', userId, to=room,
         skip_sid=request.sid)  # type: ignore


@socketio.on('leave')
def on_leave(data):
    userId = data['userId']
    room = data['room']
    if room in room_users and userId in room_users[room]:
        room_users[room].remove(userId)
    # Delete room if no users are left inside
    if not room_users[room]:
        del room_users[room]
    # Delete the client's request SID
    if userId in clients[room]:
        del clients[room][userId]
    leave_room(room)
    data = {'userId': userId, 'type': 'leave'}
    send(data, to=room)


@socketio.on('chat')
def send_chat_message(data):
    room = data['to']
    send(data, to=room)


@socketio.on('data')
def transfer_data(message):
    room = message['room']
    peer_user_id = message['peerUserId']
    peer_to_send = clients[room][peer_user_id]
    if not peer_to_send:
        print('Peer to send data to not found')
        return
    user_id = message['userId']
    data = message['data']
    data['userId'] = user_id
    print('DataEvent: {} is sending the data:\n {}\n to {}'.format(
        user_id, data, peer_user_id))
    emit('data', data, to=peer_to_send)


@socketio.on('checkId')
def check_roomId(data):
    roomId = data['roomId']
    if roomId not in room_users:
        data = {'result': False}
    else:
        data = {'result': True}
    emit('status', data, to=request.sid)  # type: ignore


@socketio.on('check-capacity')
def check_max_capacity(data):
    roomId = data['roomId']
    if len(room_users[roomId]) == 2:
        data = {'result': True}
    else:
        data = {'result': False}
    emit('capacity', data, to=request.sid)  # type: ignore


@socketio.on_error_default
def default_error_handler(e):
    print("Error: {}".format(e))
    socketio.stop()


if __name__ == '__main__':
    socketio.run(app, debug=True)
