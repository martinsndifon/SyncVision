'use strict';

const mediaContainers = document.getElementById('media_containers');
const screenContainer = document.getElementById('screen_container');
const messageBox = document.getElementById('chat-messages');
const sendbutton = document.getElementById('sendMessageButton');
const messageInput = document.getElementById('messageInput');
const endCall = document.getElementById('leave-btn');
const audioToggle = document.getElementById('audiotoggle');
const videoToggle = document.getElementById('videotoggle');
const placeholderText = document.getElementById('placeholder-text');
const infoSection = document.getElementById('info-section');
const notice = document.getElementById('notice');
const screenShare = document.getElementById('share_screen_btn');
const userCount = document.getElementById('user-count');

const socket = io({ autoConnect: false });
const connectedPeers = {};
const connectedPeersOptions = {};
let screenSharing = false;
let screenStream;
let screenTracks = [];
// screen Media Stream Id
let remoteScreenStreamId;
// user count
let count = 1;

screenShare.addEventListener('click', async () => {
  if (screenSharing && screenSharing.peerId != userId) {
    const peerName = connectedPeersOptions[screenSharing.peerId].username;
    flashMessage(`${peerName} is currently sharing their screen.`, 'error');
    return;
  } else if (screenSharing.peerId === userId) {
    //end the screen sharing and return;
    // send screen stream end event
    await socket.emit('screenStreamEnd', {
      roomId: roomId,
      screen: 'end',
    });
    // Undo the screen share styles
    await undoScreenStyles();
    screenContainer.replaceChildren();
    screenSharing = false;
    screenStream.getTracks().forEach((track) => track.stop());
    screenShare.classList.remove('active-screen');
    return;
  }

  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    screenShare.classList.add('active-screen');
    screenTracks = screenStream.getTracks();
    // Event for when the user stops sharing there screen by clicking stop sharing
    screenTracks[0].addEventListener('ended', async () => {
      //end the screen sharing and return;
      // send screen stream end event
      await socket.emit('screenStreamEnd', {
        roomId: roomId,
        screen: 'end',
      });
      // Undo the screen share styles
      await undoScreenStyles();
      screenContainer.replaceChildren();
      screenSharing = false;
      screenShare.classList.remove('active-screen');
    });

    screenSharing = { peerId: userId };

    // Adds styling for screen sharing
    const video = await createScreenShare(userId, screenStream);
    screenContainer.append(video);
    await addScreenStyles();

    // send the streamId
    await socket.emit('streamId', {
      streamId: screenStream.id,
      to: roomId,
      peerId: userId,
    });

    // If there are any peer connections, add the tracks to them
    const connections = Object.entries(connectedPeers);
    if (connections.length > 0) {
      for (const connection of connections) {
        for (const track of screenTracks) {
          const peerConnection = connection[1];
          peerConnection.addTrack(track, screenStream);
        }

        await updateSDP(connection, setAndSendLocalDescription);
      }
    }
    // attach a video element to the screen_container and attach the stream. Add the necessary styles
  } catch (e) {
    //Do nothing if user fails to grant permission.
  }
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
    async () => {
      if (screenSharing && screenSharing.peerId === userId) {
        screenStream.getTracks().forEach((track) => track.stop());
        await socket.emit('screenStreamEnd', {
          roomId: roomId,
          screen: 'end',
        });
      }
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
  socket.emit('connected', { room: roomId });
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
    flashMessage(`${message.username} joined`);
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
  } else if (message.type == 'connected') {
    // When a new user connects successfully, If screen sharing is on, send the stream Id
    if (screenSharing && screenSharing.peerId == userId) {
      await socket.emit('streamId', {
        to: message.from,
        streamId: screenStream.id,
        peerId: userId,
      });
    }
  } else if (message.type == 'streamId') {
    remoteScreenStreamId = message.streamId;
    screenSharing = { peerId: message.peerId };
  } else if (message.type == 'screenStreamEnd') {
    // Undo screen sharing styles
    await undoScreenStyles();
    screenContainer.replaceChildren();
    screenSharing = false;
  } else {
    // On 'leave', remove the user video element and their connection object
    const peerUserId = message.userId;
    let remoteVideo = document.getElementById(`${peerUserId}_media`);
    if (remoteVideo) {
      remoteVideo.remove();
    }
    adjustContainers(mediaContainers, null, 'reAdjustContainer', screenSharing);
    delete connectedPeers[peerUserId];
    // update count
    count -= 1;
    userCount.innerText = count;

    if (Object.keys(connectedPeers).length === 0) {
      infoSection.classList.remove('hide');
      infoSection.classList.add('show');
    }
    flashMessage(`${message.username} left`);
  }
});

function flashMessage(message, type) {
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
      socket.emit('join', { room: roomId });
      userCount.innerText = count;
    })
    .catch(async () => {
      flashMessage('Give permission to media devices', 'error');
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
    adjustContainers(
      mediaContainers,
      remoteContainer,
      'addContainer',
      screenSharing
    );
    if (constraints) {
      await toggleMediaNotice('audio', constraints, peerUserId);
      await toggleMediaNotice('video', constraints, peerUserId);
    }
    infoSection.classList.add('hide');
    infoSection.classList.remove('show');
  } else if (event.streams[0].id === remoteScreenStreamId) {
    // create and append stream
    const video = await createScreenShare(
      screenSharing.peerId,
      event.streams[0]
    );
    // Adjust the styles for screen sharing.
    await addScreenStyles();
    screenContainer.append(video);
  }
};

// Create a new peer connection
const createPeerConnection = async (peerUserId) => {
  try {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:standard.relay.metered.ca:80",
          username: "210be63621a37c411dd757ce",
          credential: "bgq0yXhrFsApyv26",
        },
        {
          urls: "turn:standard.relay.metered.ca:80?transport=tcp",
          username: "210be63621a37c411dd757ce",
          credential: "bgq0yXhrFsApyv26",
        },
        {
          urls: "turn:standard.relay.metered.ca:443",
          username: "210be63621a37c411dd757ce",
          credential: "bgq0yXhrFsApyv26",
        },
        {
          urls: "turns:standard.relay.metered.ca:443?transport=tcp",
          username: "210be63621a37c411dd757ce",
          credential: "bgq0yXhrFsApyv26",
        },
      ],
    });
    pc.onicecandidate = (event) => onIceCandidate(event, peerUserId);
    pc.ontrack = (event) => onTrack(event, peerUserId);
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
    // Add screen sharing tracks if any
    if (screenTracks.length > 0) {
      for (const track of screenTracks) {
        pc.addTrack(track, screenStream);
      }
    }
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
  // in case of screen sharing
  let PeerConnection;

  if (peerUserId in connectedPeers) {
    PeerConnection = connectedPeers[peerUserId];
  } else {
    // Create an RTCPeerConnection for the peer with userId
    PeerConnection = await createPeerConnection(peerUserId);
    connectedPeers[peerUserId] = PeerConnection;
    // Increase user count for host user
    count += 1;
    userCount.innerText = count;
  }

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
  // In case screen sharing
  let peerConnection;

  if (peerUserId in connectedPeers) {
    peerConnection = connectedPeers[peerUserId];
  } else {
    // Create an RTCPeerConnection for the peer
    peerConnection = await createPeerConnection(peerUserId);
    connectedPeers[peerUserId] = peerConnection;
    // Increase user count for remote user
    count += 1;
    userCount.innerText = count;
  }

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
