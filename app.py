#!/usr/bin/python3
"""flask app init"""
from flask import Flask, session, request, render_template
from views import app_views
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from shared_data import room_users


app = Flask(__name__)
app.config['SECRET_KEY'] = '!syncvisionsecretkey!'
socketio = SocketIO(app)
app.register_blueprint(app_views)


@app.errorhandler(404)
def not_found(error):
    """Handle errors and serves the 404 page"""
    return render_template('404.html')


@socketio.on('connected')
def handle_my_custom_event(data):
    """Confirm socketio connection"""
    print('Received ', data)


# Store users request SIDs
clients = {}


@socketio.on('join')
def on_join(data):
    """Handle join event - joins users to the room and sends back a response"""
    userId = session['userId']
    username = session['username']
    room = data['room']
    join_room(room)
    if room not in room_users:
        room_users[room] = []
    if userId not in room_users[room]:
        room_users[room].append(userId)

    if room not in clients:
        clients[room] = {}
    if userId not in clients[room]:
        clients[room][userId] = request.sid  # type: ignore

    data = {'username': username, 'type': 'join'}
    send(data, to=room, skip_sid=request.sid)  # type: ignore
    emit('ready', userId, to=room,
         skip_sid=request.sid)  # type: ignore


@socketio.on('leave')
def on_leave(data):
    """Handle leave event - Remove the user from the room"""
    userId = data['userId']
    username = data['username']
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
    if 'host' in session:
        print('deleted session for the host user on leave')
        session.pop('host', None)
    data = {'userId': userId, 'username': username, 'type': 'leave'}
    send(data, to=room, skip_sid=request.sid)


@socketio.on('chat')
def send_chat_message(data):
    """Handle chat - Sends chat messages to the room"""
    room = data['to']
    send(data, to=room)


@socketio.on('data')
def transfer_data(message):
    """
    Main signalling server to handle sending exchange WebRTC connection
    data between the peers in the room
    """
    room = message['room']
    peer_user_id = message['peerUserId']
    peer_to_send = clients[room][peer_user_id]
    if not peer_to_send:
        # print('Peer to send data to not found')
        return
    user_id = message['userId']
    data = message['data']
    data['userId'] = user_id
    # print('DataEvent: {} is sending the data:\n {}\n to {}'.format(
    #    user_id, data, peer_user_id))
    emit('data', data, to=peer_to_send)


@socketio.on('checkId')
def check_roomId(data):
    """Check if the room exist"""
    roomId = data['roomId']
    if roomId not in room_users:
        data = {'result': 'False'}
    else:
        data = {'result': 'True'}
    emit('status', data, to=request.sid)  # type: ignore


@socketio.on('check-capacity')
def check_max_capacity(data):
    """Check if the room is already at maximum capacity"""
    roomId = data['roomId']
    if len(room_users[roomId]) == 6:
        data = {'result': 'True'}
    else:
        data = {'result': 'False'}
    emit('capacity', data, to=request.sid)  # type: ignore


@socketio.on_error_default
def default_error_handler(e):
    """Print error and stop the socketio server on error"""
    print("Error: {}".format(e))
    socketio.stop()


if __name__ == '__main__':
    socketio.run(app, debug=True)
