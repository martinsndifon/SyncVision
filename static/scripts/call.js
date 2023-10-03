'use strict';

const mediaContainers = document.getElementById('media_containers');
const messageBox = document.getElementById('chat-messages');
const sendbutton = document.getElementById('sendMessageButton');
const messageInput = document.getElementById('messageInput');
const endCall = document.getElementById('leave-btn');
const audioToggle = document.getElementById('audiotoggle');
const videoToggle = document.getElementById('videotoggle');
const placeholderText = document.getElementById('placeholder-text');
const infoSection = document.getElementById('info-section');
const notice = document.getElementById('notice');
const screeenShare = document.getElementById('share_screen_btn');

const socket = io({ autoConnect: false });
const connectedPeers = {};
const connectedPeersOptions = {};

screeenShare.addEventListener('click', async () => {
  await flashMessage('Soon to be implemented...');
});

audioToggle.addEventListener('click', toggleAudio);
videoToggle.addEventListener('click', toggleVideo);

// Audio/video constraints
constraints.audio = constraints.audio === 'True' ? true : false;
constraints.video = constraints.video === 'True' ? true : false;

//function to mute/unmute audio
async function toggleAudio(e) {
  const audioTracks = localStream.getAudioTracks();
  const defaultTrack = audioTracks[0];
  if (defaultTrack.enabled) {
    defaultTrack.enabled = false;
    constraints.audio = false;

    // toggle notice and send the change to the room
    await toggleMediaNotice('audio', constraints, 'local');
    const data = {
      userId,
      constraints,
      roomId,
      type: 'mediaOptionChange',
    };
    socket.emit('mediaOptionChange', data);

    // styling
    audioToggle.style.backgroundColor = '#ed2939';
    audioToggle.children[0].innerText = 'mic_off';
  } else {
    defaultTrack.enabled = true;
    constraints.audio = true;
    // toggle notice and send the change to the room
    await toggleMediaNotice('audio', constraints, 'local');
    const data = {
      userId,
      constraints,
      roomId,
      type: 'mediaOptionChange',
    };
    socket.emit('mediaOptionChange', data);

    // add styling
    audioToggle.style.backgroundColor = '#960aee';
    audioToggle.children[0].innerText = 'mic';
  }
}

async function toggleVideo(e) {
  const videoTracks = localStream.getVideoTracks();
  const defaultTrack = videoTracks[0];
  if (defaultTrack.enabled) {
    defaultTrack.enabled = false;
    constraints.video = false;
    // toggle notice and send the change to the room

    await toggleMediaNotice('camera', constraints, 'local');
    const data = {
      userId,
      constraints,
      roomId,
      type: 'mediaOptionChange',
    };
    socket.emit('mediaOptionChange', data);

    // style
    videoToggle.style.backgroundColor = '#ed2939';
    videoToggle.children[0].innerText = 'videocam_off';
  } else {
    defaultTrack.enabled = true;
    constraints.video = true;
    // toggle notice and send the change to the room
    await toggleMediaNotice('camera', constraints, 'local');
    const data = {
      userId,
      constraints,
      roomId,
      type: 'mediaOptionChange',
    };
    socket.emit('mediaOptionChange', data);

    // style
    videoToggle.style.backgroundColor = '#960aee';
    videoToggle.children[0].innerText = 'videocam';
  }
}

const sendMessage = () => {
  const message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('chat', { from: username, message, type: 'chat', to: roomId });
    messageInput.value = '';
  }
};

sendbutton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
    e.preventDefault();
  }
});

// Function to emit the 'leave' event
const emitLeaveEvent = async () => {
  await socket.emit(
    'leave',
    {
      userId: userId,
      room: roomId,
      username: username,
    },
    async (data) => {
      await hangup();
      window.removeEventListener('beforeunload', emitLeaveEvent);
      window.removeEventListener('unload', emitLeaveEvent);
      window.location.href = '/';
    }
  );
};

endCall.addEventListener('click', async () => {
  await emitLeaveEvent();
});

window.addEventListener('beforeunload', emitLeaveEvent);

window.addEventListener('unload', emitLeaveEvent);

socket.on('connect', function () {
  socket.emit('connected', { data: 'Connected so signalling server!' });
});

socket.on('message', async (message) => {
  if (message.type == 'chat') {
    const from = message.from;
    if (from != username) {
      notice.classList.remove('no_show');
    }
    if (chatVisible) {
      notice.classList.add('no_show');
    }
    const m = message.message;
    const div = document.createElement('div');
    const header = document.createElement('h6');
    header.setAttribute('class', 'message-header');
    const p = document.createElement('p');
    p.setAttribute('class', 'message');
    p.textContent = m;
    header.textContent = from;
    div.appendChild(header);
    div.appendChild(p);
    messageBox.append(div);
    messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
  } else if (message.type == 'join') {
    infoSection.classList.remove('show');
    infoSection.classList.add('hide');
    await flashMessage(`${message.username} joined`);
  } else if (message.type == 'mediaOption') {
    // Receives the media Options
    connectedPeersOptions[message.userId] = {
      constraints: message.constraints,
      username: message.username,
    };
    const data = {
      constraints,
      username,
      userId,
      to: message.from,
      type: 'mediaOptionReply',
    };
    await socket.emit('mediaOptionReply', data);
  } else if (message.type == 'mediaOptionReply') {
    // receives the mediaOption Reply
    connectedPeersOptions[message.userId] = {
      username: message.username,
      constraints: message.constraints,
    };
  } else if (message.type == 'mediaOptionChange') {
    //receive the mediaOptionChanges
    connectedPeersOptions[message.userId].constraints = message.constraints;
    await toggleMediaNotice('audio', message.constraints, message.userId);
    await toggleMediaNotice('video', message.constraints, message.userId);
  } else {
    // On 'leave', remove the user video element and their connection object
    const peerUserId = message.userId;
    let remoteVideo = document.getElementById(`${peerUserId}_media`);
    if (remoteVideo) {
      remoteVideo.remove();
    }
    adjustContainers(mediaContainers, null, 'reAdjustContainer');
    delete connectedPeers[peerUserId];

    if (Object.keys(connectedPeers).length === 0) {
      infoSection.classList.remove('hide');
      infoSection.classList.add('show');
    }
    await flashMessage(`${message.username} left`);
  }
});

async function flashMessage(message, type) {
  if (type) {
    const flashMessage = document.getElementById('flash-message');
    flashMessage.textContent = message;
    flashMessage.classList.add('error');

    setTimeout(() => {
      flashMessage.classList.remove('error');
    }, 5000);
  } else {
    const flashMessage = document.getElementById('flash-message');
    flashMessage.textContent = message;
    flashMessage.classList.add('show');

    setTimeout(() => {
      flashMessage.classList.remove('show');
    }, 1000);
  }
}

// local video and stream
let localVideo;
let localStream;

// Function to send data to the server on 'data' emit
const sendData = async (peerUserId, data) => {
  await socket.emit('data', {
    peerUserId: peerUserId,
    userId: userId,
    room: roomId,
    data: data,
  });
};

// Start the connection: get stream, connect socketIO and join a room
const startConnection = async () => {
  await navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then(async (stream) => {
      localStream = stream;
      const mediaContainerData = await createMediaContainer(
        'local',
        localStream,
        username
      );
      localVideo = mediaContainerData[0];
      // append the local media (the container that holds the local video)
      mediaContainers.append(mediaContainerData[1]);

      const data = {
        username,
        userId,
        constraints,
        roomId,
        type: 'mediaOption',
      };
      // connect to socketio
      socket.connect();

      // Emit media options after creating local view
      await socket.emit('mediaOption', data);

      await toggleMediaNotice('audio', constraints, 'local');
      await toggleMediaNotice('video', constraints, 'local');
      const audioTracks = localStream.getAudioTracks();
      const videoTracks = localStream.getVideoTracks();

      audioTracks.forEach((track) => {
        track.enabled = constraints.audio;
        if (track.enabled) {
          // styling
          audioToggle.children[0].innerText = 'mic';
          audioToggle.style.backgroundColor = '#960aee';
        } else {
          // add styling
          audioToggle.style.backgroundColor = '#ed2939';
          audioToggle.children[0].innerText = 'mic_off';
        }
      });
      videoTracks.forEach((track) => {
        track.enabled = constraints.video;
        if (track.enabled) {
          // styling
          videoToggle.style.backgroundColor = '#960aee';
          videoToggle.children[0].innerText = 'videocam';
        } else {
          // add styling
          videoToggle.style.backgroundColor = '#ed2939';
          videoToggle.children[0].innerText = 'videocam_off';
        }
      });
      await socket.emit('join', { room: roomId });
    })
    .catch(async () => {
      await flashMessage('Give permission to media devices', 'error');
    });
};

// send IceCandidates
const onIceCandidate = async (event, peerUserId) => {
  if (event.candidate) {
    await sendData(peerUserId, {
      type: 'candidate',
      candidate: event.candidate,
    });
  }
};

// Set the srcObject of the remote video element’s reference to the first stream in the track
const onTrack = async (event, peerUserId) => {
  let remoteContainer = document.getElementById(`${peerUserId}_media`);
  if (!remoteContainer) {
    // create video element for the peer
    const username = connectedPeersOptions[peerUserId].username;
    const constraints = connectedPeersOptions[peerUserId].constraints;
    if (connectedPeersOptions[peerUserId]) {
      remoteContainer = await createMediaContainer(
        peerUserId,
        event.streams[0],
        username
      );
    } else {
      remoteContainer = await createMediaContainer(
        peerUserId,
        event.streams[0],
        'Remote'
      );
    }
    mediaContainers.prepend(remoteContainer);
    adjustContainers(mediaContainers, remoteContainer, 'addContainer');
    if (constraints) {
      await toggleMediaNotice('audio', constraints, peerUserId);
      await toggleMediaNotice('video', constraints, peerUserId);
    }
    infoSection.classList.add('hide');
    infoSection.classList.remove('show');
  }
};

// Create a new peer connection
const createPeerConnection = async (peerUserId) => {
  // Calling the REST API TO fetch the TURN Server Credentials from openrelay
  const response = await fetch(
    'https://syncvision.metered.live/api/v1/turn/credentials?apiKey=d608f49a9ecfc62d0cfe0cfcc0c5563f7f02'
  );
  const iceServers = await response.json();
  try {
    const pc = new RTCPeerConnection({
      iceServers: iceServers,
    });
    pc.onicecandidate = (event) => onIceCandidate(event, peerUserId);
    pc.ontrack = (event) => onTrack(event, peerUserId);
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
    // console.log('PeerConnection created');
    return pc;
  } catch (error) {
    // console.error('PeerConnection failed: ', error);
    return null;
  }
};

// Set the local description of the RTCPeerConnection.
const setAndSendLocalDescription = (peerUserId, sessionDescription) => {
  const peerConnection = connectedPeers[peerUserId];
  if (peerConnection) {
    peerConnection
      .setLocalDescription(sessionDescription)
      .then(async () => {
        await sendData(peerUserId, sessionDescription);
      })
      .catch((error) => {
        // console.error(
        //   `Error setting local description for ${peerUserId}: ${error}`
        // );
      });
  } else {
    // console.error(`PeerConnection for ${peerUserId} not found`);
  }
};

// Create and send offer to other peer(s) setting local description
const sendOffer = async (peerUserId) => {
  // Create an RTCPeerConnection for the peer with userId
  const PeerConnection = await createPeerConnection(peerUserId);
  connectedPeers[peerUserId] = PeerConnection;
  // Create and send offer
  await PeerConnection.createOffer()
    .then((sessionDescription) => {
      setAndSendLocalDescription(peerUserId, sessionDescription);
    })
    .catch((error) => {
      // console.error(`Send offer failed to ${peerUserId}: ${error}`);
    });
};

// Answer an offer from a peer setting local description
const sendAnswer = async (peerUserId, offer) => {
  // Create an RTCPeerConnection for the peer
  const peerConnection = await createPeerConnection(peerUserId);
  connectedPeers[peerUserId] = peerConnection;
  // Set remote description
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  // Create and send answer
  peerConnection
    .createAnswer()
    .then((sessionDescription) => {
      setAndSendLocalDescription(peerUserId, sessionDescription);
    })
    .catch((error) => {
      // console.error(`Send answer failed to ${peerUserId}: ${error}`);
    });
};

// Handle the diff signals: offer: create a peer connection, set the remote description, and send an answer.
// answer: Set the remote description
// candidate: The ICE candidate is added
const signalingDataHandler = async (data) => {
  const peerUserId = data.userId;
  if (data.type === 'offer') {
    await sendAnswer(peerUserId, data);
  } else if (data.type === 'answer') {
    // Set remote description for the peer
    await connectedPeers[peerUserId].setRemoteDescription(
      new RTCSessionDescription(data)
    );
  } else if (data.type === 'candidate') {
    try {
      if (connectedPeers[peerUserId]) {
        // Add ICE candidate for the peer
        await connectedPeers[peerUserId].addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    } catch (error) {
      // console.error(`Error adding ICE candidate for ${peerUserId}: ${error}`);
    }
  } else {
    // console.log('Unknown Data');
  }
};

async function hangup() {
  // Close the connection when user ends the call
  if (Object.keys(connectedPeers).length > 0) {
    for (const key in connectedPeers) {
      if (connectedPeers.hasOwnProperty(key)) {
        const conn = connectedPeers[key];
        conn.close();
        delete connectedPeers[key];
      }
    }
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
}

// creates a peer connection and send and offer to the peer, fires when a new peer joins another peer in a room
socket.on('ready', async (peerUserId) => {
  await sendOffer(peerUserId);
});

// Receive the data from the server and pass it to the signalingDataHandler() to take appropriate action
socket.on('data', async (data) => {
  await signalingDataHandler(data);
});

// Journey begins here :)
(async () => {
  await startConnection();
})();
