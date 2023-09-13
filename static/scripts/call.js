'use strict';

const videoGrid = document.getElementById('video-grid');
const messageBox = document.getElementById('messagesbox');
const sendbutton = document.getElementById('send');
const inputbox = document.getElementById('inputbox');
const endCall = document.getElementById('endcall');

const socket = io({ autoConnect: false });

sendbutton.addEventListener('click', (e) => {
  const message = inputbox.value;
  socket.emit('chat', { from: userId, message, type: 'chat', to: roomId });
  inputbox.value = '';
});

// Function to emit the 'leave' event
const emitLeaveEvent = async () => {
  socket.emit('leave', { userId: userId, room: roomId });
};

endCall.addEventListener('click', async () => {
  await emitLeaveEvent();
  await hangup();
  window.location.href = 'http://127.0.0.1:5000/';
});

window.addEventListener('beforeunload', () => {
  emitLeaveEvent();
});

window.addEventListener('unload', () => {
  emitLeaveEvent();
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
  } else if (message.type == 'join') {
    const joinedUserId = message.userId;
    displayMessage(`${joinedUserId} joined the room: ${roomId}`);
  } else {
    // when multiple users is implemented, remoteVideo would be removed based on userId
    remoteVideo.remove();
    displayMessage(`${message.userId} has left the room: ${roomId}`);
  }
});

function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
}

// New code to try webRTC connection
let localVideo;
let remoteVideo;

const createLocalVideo = () => {
  // create video element for local video
  localVideo = document.createElement('video');
  localVideo.setAttribute('autoplay', true);
  localVideo.setAttribute('muted', true);
  localVideo.setAttribute('playsinline', true);
  localVideo.setAttribute('id', 'localVideo');

  // Append the video elements to the DOM
  videoGrid.appendChild(localVideo);
};

const createRemoteVideo = () => {
  // create video element for remote video
  remoteVideo = document.createElement('video');
  remoteVideo.setAttribute('autoplay', true);
  remoteVideo.setAttribute('playsinline', true);
  remoteVideo.setAttribute('id', 'remoteVideo');

  // Append the video elements to the DOM
  videoGrid.appendChild(remoteVideo);
};

let pc; // For RTCPeerConnection object
let localStream;

// Function to send data to the server on 'data' emit
const sendData = async (data) => {
  await socket.emit('data', {
    userId: userId,
    room: roomId,
    data: data,
  });
};

// Start the connection: get stream, connect socketIO and join a room
const startConnection = async () => {
  await navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      console.log('Got the local stream');
      localVideo.srcObject = stream;
      localVideo.muted = true;
      socket.connect();
      socket.emit('join', { room: roomId });
    })
    .catch((error) => {
      console.log('Could not get local stream: ', error);
    });
};

// send IceCandidates
const onIceCandidate = async (event) => {
  if (event.candidate) {
    console.log('Sending ICE candidate');
    await sendData({
      type: 'candidate',
      candidate: event.candidate,
    });
  }
};

// Set the srcObject of the remote video element’s reference to the first stream in the track
const onTrack = (event) => {
  console.log('Adding remote track');
  const checkRemoteVideo = document.getElementById('remoteVideo');
  if (!checkRemoteVideo) {
    createRemoteVideo();
  }
  remoteVideo.srcObject = event.streams[0];
};

// Calling the REST API TO fetch the TURN Server Credentials from openrelay
(async () => {
  const response = await fetch(
    'https://syncvision.metered.live/api/v1/turn/credentials?apiKey=d608f49a9ecfc62d0cfe0cfcc0c5563f7f02'
  );
  const iceServers = await response.json();
  console.log(iceServers);
})();

// Create a new peer connection
const createPeerConnection = async () => {
  // Calling the REST API TO fetch the TURN Server Credentials from openrelay
  const response = await fetch(
    'https://syncvision.metered.live/api/v1/turn/credentials?apiKey=d608f49a9ecfc62d0cfe0cfcc0c5563f7f02'
  );
  const iceServers = await response.json();
  try {
    pc = new RTCPeerConnection({
      iceServers: iceServers,
    });
    pc.onicecandidate = onIceCandidate;
    pc.ontrack = onTrack;
    localStream = localVideo.srcObject;
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
const sendOffer = async () => {
  console.log('Sending offer');
  await pc.createOffer().then(setAndSendLocalDescription, (error) => {
    console.error('Send offer failed: ', error);
  });
};

// Answer an offer from a peer setting local description
const sendAnswer = async () => {
  console.log('Sending answer');
  await pc.createAnswer().then(setAndSendLocalDescription, (error) => {
    console.error('Send answer failed: ', error);
  });
};

// Handle the diff signals: offer: create a peer connection, set the remote description, and send an answer.
// answer: Set the remote description
// candidate: The ICE candidate is added
const signalingDataHandler = async (data) => {
  if (data.type === 'offer') {
    await createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(data));
    await sendAnswer();
  } else if (data.type === 'answer') {
    await pc.setRemoteDescription(new RTCSessionDescription(data));
  } else if (data.type === 'candidate') {
    try {
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch {
      console.error('Error adding ICE candidate: ', error);
    }
  } else {
    console.log('Unknown Data');
  }
};

async function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
}

// creates a peer connection and send and offer to the peer, fires when a new peer joins another peer in a room
socket.on('ready', async () => {
  console.log('Ready to Connect!');
  await createPeerConnection();
  await sendOffer();
});

// Receive the data from the server and pass it to the signalingDataHandler() to take appropriate action
socket.on('data', async (data) => {
  console.log('Data received: ', data);
  await signalingDataHandler(data);
});

// Journey begins here :)
(async () => {
  createLocalVideo();
  createRemoteVideo();
  await startConnection();
})();
