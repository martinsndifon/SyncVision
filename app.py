#!/usr/bin/python3
"""main website flask app"""
from flask import Flask
from views import app_views
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
app.register_blueprint(app_views)


@socketio.on('my event')
def handle_my_custom_event(data):
    print('received json: ', data)

if __name__ == '__main__':
    socketio.run(app)
