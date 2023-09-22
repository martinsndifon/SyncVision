'use strict';

const joinMeeting = document.getElementById('join-meeting');
const meetingLink = document.getElementById('meeting-link-box');
const form = document.getElementById('form');

const socket = io({ autoConnect: false });


meetingLink.addEventListener('input', (e) => {
  const target = e.target;
  if (target.value.length >= 1) {
    joinMeeting.disabled = false;
    joinMeeting.ariaDisabled = false;
    joinMeeting.classList.add('join_active');
  } else {
    joinMeeting.disabled = true;
    joinMeeting.ariaDisabled = true;
    joinMeeting.classList.remove('join_active');
  }
})

joinMeeting.addEventListener('click', (event) => {
  // check the value if it is link or just ID and respond accordingly
  event.preventDefault();
  if (meetingLink.value !== '') {
    const link = meetingLink.value;
    const linkArray = link.split('/');
    const id = linkArray[linkArray.length - 1];

    socket.connect();
    // check the backend if this room with id exists before continuing
    socket.emit('checkId', { roomId: id });

    socket.on('status', (data) => {
      if (data.result == 'True') {
        socket.emit('check-capacity', { roomId: id });
        socket.on('capacity', (data) => {
          if (data.result == 'True') {
            flashMessage('The meeting is already at max capacity');
          } else {
            const route = `/call/${id}`;
            form.action = route;
            form.submit();
            form.reset();
          }
        });
      } else {
        flashMessage('The meeting may have ended or does not exist');
      }
    });
  }
});

function flashMessage(message) {
  const flashMessage = document.getElementById('flash-message');
  flashMessage.textContent = message;
  flashMessage.classList.add('show');

  setTimeout(() => {
    flashMessage.classList.remove('show');
  }, 5000);
}

// Get the current URL's search parameters
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('existence_error')) {
  flashMessage('The meeting may have ended or does not exist');
} else if (urlParams.has('capacity_error')) {
  flashMessage('The meeting is already at max capacity');
}
