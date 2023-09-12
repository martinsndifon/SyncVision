'use strict';

const videoGrid = document.getElementById('video-grid');
const messageBox = document.getElementById('messagesbox');
const sendbutton = document.getElementById('send');
const inputbox = document.getElementById('inputbox');

const socket = io({ autoConnect: false });

sendbutton.addEventListener('click', (e) => {
  const message = inputbox.value;
  // const data = {userId, message};
  socket.emit('chat', { from: userId, message, type: 'chat', to: roomId });
});

socket.on('connect', function () {
  socket.emit('my event', { data: "I'm connected!" });
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
// remoteVideo.setAttribute('muted', true);
remoteVideo.setAttribute('playsinline', true);
remoteVideo.setAttribute('id', 'remoteVideo');

// Append the video elements to the DOM
videoGrid.appendChild(localVideo);
videoGrid.appendChild(remoteVideo);

let pc; // For RTCPeerConnection object

// Function to send data to the server on 'data' emit
const sendData = (data) => {
  socket.emit('data', {
    userId: userId,
    room: roomId,
    data: data,
  });
};

// Start the connection: get stream, connect socketIO and join a room
const startConnection = () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      console.log('Got the local stream');
      localVideo.srcObject = stream;
      socket.connect();
      socket.emit('join', { room: roomId });
    })
    .catch((error) => {
      console.log('Could not get local stream: ', error);
    });
};

// send IceCandidates
const onIceCandidate = (event) => {
  if (event.candidate) {
    console.log('Sending ICE candidate');
    sendData({
      type: 'candidate',
      candidate: event.candidate,
    });
  }
};

// Set the srcObject of the remote video element’s reference to the first stream in the track
const onTrack = (event) => {
  console.log('Adding remote track');
  remoteVideo.srcObject = event.streams[0];
};

// Create a new peer connection
const createPeerConnection = () => {
  try {
    pc = new RTCPeerConnection({});
    pc.onicecandidate = onIceCandidate;
    pc.ontrack = onTrack;
    const localStream = localVideo.srcObject;
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
    console.log('PeerConnection created');
  } catch (error) {
    console.error('PeerConnection failed: ', error);
  }
};

// Set the local description of the RTCPeerConnection.
const setAndSendLocalDescription = (sessionDescription) => {
  pc.setLocalDescription(sessionDescription);
  console.log('Local description set');
  sendData(sessionDescription);
};

// Create and send offer to other peer(s) setting local description
const sendOffer = () => {
  console.log('Sending offer');
  pc.createOffer().then(setAndSendLocalDescription, (error) => {
    console.error('Send offer failed: ', error);
  });
};

// Answer an offer from a peer setting local description
const sendAnswer = () => {
  console.log('Sending answer');
  pc.createAnswer().then(setAndSendLocalDescription, (error) => {
    console.error('Send answer failed: ', error);
  });
};

// Handle the diff signals: offer: create a peer connection, set the remote description, and send an answer.
// answer: Set the remote description
// candidate: The ICE candidate is added
const signalingDataHandler = (data) => {
  if (data.type === 'offer') {
    createPeerConnection();
    pc.setRemoteDescription(new RTCSessionDescription(data));
    sendAnswer();
  } else if (data.type === 'answer') {
    pc.setRemoteDescription(new RTCSessionDescription(data));
  } else if (data.type === 'candidate') {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  } else {
    console.log('Unknown Data');
  }
};

// creates a peer connection and send and offer to the peer, fires when a new peer joins another peer in a room
socket.on('ready', () => {
  console.log('Ready to Connect!');
  createPeerConnection();
  sendOffer();
});

// Receive the data from the server and pass it to the signalingDataHandler() to take appropriate action
socket.on('data', (data) => {
  console.log('Data received: ', data);
  signalingDataHandler(data);
});

// Journey begins here :)
startConnection();
