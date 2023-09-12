'use strict';

const videoGrid = document.getElementById('video-grid');
const messageBox = document.getElementById('messagesbox');
const sendbutton = document.getElementById('send');
const inputbox = document.getElementById('inputbox');

const socket = io();

sendbutton.addEventListener('click', (e) => {
  const message = inputbox.value;
  // const data = {userId, message};
  socket.emit('chat', { from: userId, message, type: 'chat', to: roomId });
});

socket.on('connect', function () {
  socket.emit('my event', { data: "I'm connected!" });
  socket.emit('join', { room: roomId });
});

socket.on('message', (message) => {
  if (message.type == 'chat') {
    const from = message.from;
    const m = message.message;
    const p = document.createElement('p');
    const content = `From ${from}: ${m}`;
    p.textContent = content;
    messageBox.append(p);
  } else {
    const joinedUserId = message.userId;
    displayMessage(`${joinedUserId} joined the room: ${roomId}`);
  }
});

function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
}

// New code to try webRTC connection

// create video element for local video
const localVideo = document.createElement('video');
localVideo.setAttribute('autoplay', true);
localVideo.setAttribute('muted', true);
localVideo.setAttribute('playsinline', true);
localVideo.setAttribute('id', 'localVideo');

// create video element for remote video
const remoteVideo = document.createElement('video');
remoteVideo.setAttribute('autoplay', true);
remoteVideo.setAttribute('muted', true);
remoteVideo.setAttribute('playsinline', true);
remoteVideo.setAttribute('id', 'remoteVideo');

// Append the video elements to the DOM
videoGrid.appendChild(localVideo);
videoGrid.appendChild(remoteVideo);
