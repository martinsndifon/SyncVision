let localStream;

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
    document.getElementById("camera-btn").style.backgroundColor = "#f85858";
  } else {
    videoTrack.enabled = true;
    document.getElementById("camera-btn").style.backgroundColor = "#b366f9";
  }
};

let toogleMic = async () => {
  let audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    document.getElementById("mic-btn").style.backgroundColor = "#f85858";
  } else {
    audioTrack.enabled = true;
    document.getElementById("mic-btn").style.backgroundColor = "#b366f9";
  }
};

document.getElementById("camera-btn").addEventListener("click", toogleCamera);
document.getElementById("mic-btn").addEventListener("click", toogleMic);
init();

const userElement = document.getElementById("userName");

userElement.addEventListener("focus", FunctionFocus);
userElement.addEventListener("blur", FunctionBlur);

function FunctionFocus() {
  // Code to execute when the input gains focus
  console.log("Input gained focus");
  const submitButton = document.getElementById("name-btn");
  submitButton.classList.remove("inactive");
  submitButton.classList.add("active");
  submitButton.disabled = false;
}

function FunctionBlur() {
  // Code to execute when the input loses focus
  console.log("Input lost focus");
  const submitButton = document.getElementById("name-btn");
  submitButton.classList.remove("active");
  submitButton.classList.add("inactive");
  submitButton.disabled = true;
}
