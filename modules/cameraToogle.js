let isMuted = false;
let toggleButtonCam = document.getElementById("camera");

toggleButtonCam.addEventListener("click", toggleMuteUnmute);
function toggleMuteUnmute() {
  if (isMuted) {
    //Unmute;
    // console.log("Input gained focus");
    toggleButtonCam.classList.remove("mute");
    toggleButtonCam.classList.add("unmute");
  } else {
    // Mute;
    // console.log("Input lose focus");
    toggleButtonCam.classList.remove("unmute");
    toggleButtonCam.classList.add("mute");
  }
  isMuted = !isMuted;
}

export default toggleButtonCam;
