// let localTracks = [];
// let remoteUsers = {};

// // function to join room
// let joinRoomInit = async () => {
//   joinStream();
// };

// let joinStream = async () => {
//   let player = `<div class="video-container" id="user-container-3">
//                     <div class="video-player" id="user-id"></div>
//                 </div>`;
//   document
//     .getElementById("streams-container")
//     .insertAdjacentHTML("beforeend", player);
//   document
//     .getElementById("user-container-user-id")
//     .addEventListener("click", expandVideoFrame);
//   localTracks[0].play("user-id");
// };

// //function to delete user
// let handleUserLeft = async (user) => {
//   delete remoteUsers();
//   document.getElementById();
// };

// let handleUserPublished = async () => {
//   let player = `<div class="video-container" id="user-container-1">
//                     <div class="video-player" id="user-id"></div>
//                 </div>`;
//   document
//     .getElementById("streams-container")
//     .insertAdjacentHTML("beforeend", player);
// };

// joinRoomInit();

// // To display Frame to the Large frame

// let displayFrame = document.getElementById("stream-box");
// let videoFrames = document.getElementsByClassName("video-container");
// let userIdInDisplayFrame = null;

// let expandVideoFrame = (e) => {
//   let child = displayFrame.children[0];
//   if (child) {
//     document.getElementById("streams-container").appendChild(child);
//   }

//   displayFrame.style.display = "block";
//   displayFrame.appendChild(e.currentTarget);
//   userIdInDisplayFrame = e.currentTarget.id;

//   for (let i = 0; videoFrames.length > i; i++) {
//     if (videoFrames[i].id != userIdInDisplayFrame) {
//       videoFrames[i].style.height = "100px";
//       videoFrames[i].style.width = "100px";
//     }
//   }
// };

// for (let i = 0; videoFrames.length > i; i++) {
//   videoFrames[i].addEventListener("click", expandVideoFrame);
// }

// let hideDisplayFrame = () => {
//   userIdInDisplayFrame = null;
//   displayFrame.style.display = null;
//   let child = displayFrame.children[0];

//   document.getElementById("streams-container").appendChild(child);
//   if (videoFrames[i].id != userIdInDisplayFrame) {
//     videoFrames[i].style.height = "100px";
//     videoFrames[i].style.width = "100px";
//   }
// };

// displayFrame.addEventListener("click", hideDisplayFrame);

// function toggleContainers() {
//   let container1 = document.getElementById("container1");
//   let container2 = document.getElementById("container2");
//   let toggleButton = document.getElementById("toggle-btn");

//   if (container1.style.display === "none") {
//     container1.style.display = "block";
//     container2.style.display = "none";
//   } else {
//     container1.style.display = "none";
//     container2.style.display = "block";
//   }
// }

// toggleButton.addEventListener("click", toggleContainers);

document.addEventListener("DOMContentLoaded", function () {
  var container1 = document.getElementById("container1");
  var container2 = document.getElementById("container2");
  var icon1 = document.getElementById("icon1");
  var icon2 = document.getElementById("icon2");
  var toggleButton = document.getElementById("toggle-btn");

  toggleButton.addEventListener("click", function () {
    if (container1.style.display === "none" && icon1.style.display === "none") {
      container1.style.display = "block";
      container2.style.display = "none";
      icon1.style.display = "block";
      icon2.style.display = "none";
    } else {
      container1.style.display = "none";
      container2.style.display = "block";
      icon1.style.display = "none";
      icon2.style.display = "block";
    }
  });
});

// if (
//       container2.style.display === "none" ||
//       container1.style.display === "block"
//     ) {
//       container1.style.display = "block";
//       container2.style.display = "none";
//     } else {
//       container1.style.display = "none";
//       container2.style.display = "block";
//     }
