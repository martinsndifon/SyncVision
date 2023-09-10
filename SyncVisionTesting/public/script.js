const socket = io('/');
const videoGrid = document.getElementById('video-grid');
let myPeer;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myPeer = new Peer(undefined, {
      host: '/',
      port: '3001',
    });
    const myVideo = document.createElement('video');
    myVideo.muted = true; // mute local audio to avoid playback
    addVideoStream(myVideo, stream);

    // This code runs immediately a user connects to peerjs
    myPeer.on('open', (id) => {
      socket.emit('join-room', ROOM_ID, id);
    });

    // we listen for when someone tries to call us, answer the call and send them our stream
    myPeer.on('call', (call) => {
      // Answer the call and send them your stream
      call.answer(stream);
      const video = document.createElement('video');
      // Get their own stream
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      console.log('User connected: ' + userId);
      connectToNewUser(userId, stream); // we connect to the new user and pass our video stream to them
    });

    // Close the connection to the user and remove them from the call
    socket.on('user-disconnected', (userId) => {
      if (peers[userId]) peers[userId].close();
    });
  });

// Function to load the stream onto the video element and play it on successful loading
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  // on return of the above myPeer.call we get back their video stream and listen for it below
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  // Remove the video element from people who have left the call
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}
