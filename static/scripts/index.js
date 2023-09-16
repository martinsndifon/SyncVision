'use strict';

const newMeeting = document.getElementById('new-meeting');
const joinMeeting = document.getElementById('join-meeting');
const meetingLink = document.getElementById('meeting-link-box');

newMeeting.addEventListener('click', () => {
  window.location.href = 'http://127.0.0.1:5000/call/';
});

joinMeeting.addEventListener('click', () => {
  // check the value if it is link or just ID and respond accordingly
  const link = meetingLink.value;
  const linkArray = link.split('/');
  const id = linkArray[linkArray.length - 1];
  window.location.href = `http://127.0.0.1:5000/call/${id}`;
});
