'use strict';

const newMeeting = document.getElementById('new-meeting');
const joinMeeting = document.getElementById('join-meeting');
const meetingLink = document.getElementById('meeting-link-box');

const socket = io({ autoConnect: false });

newMeeting.addEventListener('click', () => {
  window.location.href = 'http://127.0.0.1:5000/call/';
});

joinMeeting.addEventListener('click', () => {
  // check the value if it is link or just ID and respond accordingly
  const link = meetingLink.value;
  const linkArray = link.split('/');
  const id = linkArray[linkArray.length - 1];

  socket.connect();
  // check the backend if this room with id exists before continuing
  socket.emit('checkId', { roomId: id });

  socket.on('status', (data) => {
    if (data.result) {
      socket.emit('check-capacity', { roomId: id });
      socket.on('capacity', (data) => {
        if (data.result) {
          window.location.href = 'http://127.0.0.1:5000/max-capacity/';
        } else {
          window.location.href = `http://127.0.0.1:5000/call/${id}`;
        }
      });
    } else {
      window.location.href = 'http://127.0.0.1:5000/expired/';
    }
  });
});
