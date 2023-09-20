let localStream;

const audioMute = document.getElementById('audio_mute');
const videoDisable = document.getElementById('video_disable');
const submit = document.getElementById('submit-btn');
const form = document.getElementById('form');

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  document.getElementById("localVideo").srcObject = localStream;
};

let toogleCamera = async () => {
  let videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    videoDisable.checked = true;
    document.getElementById("camera-btn").style.backgroundColor = "#f85858";
  } else {
    videoTrack.enabled = true;
    videoDisable.checked = false;
    document.getElementById("camera-btn").style.backgroundColor = "#b366f9";
  }
};

let toogleMic = async () => {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    audioMute.checked = true;
    document.getElementById("mic-btn").style.backgroundColor = "#f85858";
  } else {
    audioTrack.enabled = true;
    audioTrack.enabled = false;
    audioMute.checked = false;
    document.getElementById("mic-btn").style.backgroundColor = "#b366f9";
  }
};

document.getElementById("camera-btn").addEventListener("click", toogleCamera);
document.getElementById("mic-btn").addEventListener("click", toogleMic);
init();

const nameInput = document.getElementById("userName");

nameInput.addEventListener("input", handleInput);
form.addEventListener('submit', handleSubmit)

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
