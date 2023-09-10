'use strict'

const socket = io();
socket.on('connect', function() {
  socket.emit('my event', {data: 'I\'m connected!'});
});

console.log('RoomId', roomId);
