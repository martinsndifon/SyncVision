let isMuted = false;
let toggleButton = document.getElementById("volume");

toggleButton.addEventListener("click", toggleMuteUnmute);
function toggleMuteUnmute() {
  if (isMuted) {
    //Unmute;
    // console.log("Input gained focus");
    toggleButton.classList.remove("mute");
    toggleButton.classList.add("unmute");
  } else {
    // Mute;
    // console.log("Input lose focus");
    toggleButton.classList.remove("unmute");
    toggleButton.classList.add("mute");
  }
  isMuted = !isMuted;
}

export default toggleButton;
