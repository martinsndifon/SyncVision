let localStream;

const mic = document.getElementById('mic-btn');
const camera = document.getElementById('camera-btn');
const audioMute = document.getElementById('audio_mute');
const videoDisable = document.getElementById('video_disable');
const submit = document.getElementById('submit-btn');
const form = document.getElementById('form');
const input = document.getElementById('userName');


submit.addEventListener('click', (e) => {
  form.submit();
  form.reset();
})


let init = async () => {
  await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  }).then((stream) => {
    localStream = stream;
    document.getElementById("localVideo").srcObject = localStream;
  })
};


const toggleCamera = async (e) => {
  let target = e.target;
  if (target.tagName != 'BUTTON') {
    target = target.closest('BUTTON');
  }
  if (videoDisable.checked) {
    videoDisable.checked = false;
  } else {
    videoDisable.checked = true;
  }
  const videoTracks = localStream.getVideoTracks();
  videoTracks.forEach((track) => track.enabled = !videoDisable.checked);
  if (target.classList.contains('enable_color')) {
    target.classList.remove('enable_color')
  } else {
    target.classList.add('enable_color');
  }
  if (target.children[0].innerText == 'videocam') {
    target.children[0].innerText = 'videocam_off';
  } else {
    target.children[0].innerText = 'videocam';
  }
};

const toggleMic = async (e) => {
  let target = e.target;
  if (target.tagName != 'BUTTON') {
    target = target.closest('BUTTON');
  }
  if (audioMute.checked) {
    audioMute.checked = false;
  } else {
    audioMute.checked = true;
  }
  const audioTracks = localStream.getAudioTracks();
  audioTracks.forEach((track) => track.enabled = !audioMute.checked);
  if (target.classList.contains('enable_color')) {
    target.classList.remove('enable_color')
  } else {
    target.classList.add('enable_color');
  }
  if (target.children[0].innerText == 'mic') {
    target.children[0].innerText = 'mic_off';
  } else {
    target.children[0].innerText = 'mic';
  }
}

camera.addEventListener("click", toggleCamera);
mic.addEventListener("click", toggleMic);
init();

const nameInput = document.getElementById("userName");

nameInput.addEventListener("input", handleInput);

function handleInput(e) {
  const target = e.target;
  const value = target.value.trim();
  if (value.length >= 2) {
    submit.classList.add("active");
    submit.disabled = false;
  } else {
    submit.classList.remove('active');
    submit.disabled = true;
  }
}
