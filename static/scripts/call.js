'use strict';

const socket = io();
socket.on('connect', function () {
  socket.emit('my event', { data: "I'm connected!" });
  socket.emit('join', { username: 'Martins', room: roomId });
});

socket.on('message', (message) => {
  displayMessage(message);
});

function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
}
