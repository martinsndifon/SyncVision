# SyncVision

## WebRTC Video Conferencing App

The WebRTC Video Conferencing App (syncvision) is a real-time video and audio conferencing application built using WebRTC, Flask, and Socket.IO. It allows users to create and join virtual meeting rooms for online video conferencing.

### Features

- Create and join video conference rooms.
- Real-time audio and video streaming.
- Text chat functionality within the conference.
- Screen sharing capabilities (in-development).
- Mute/unmute audio and video during the conference.
- Responsive design for both desktop and mobile devices.

### Technologies Used

- **WebRTC**: Enables real-time audio and video communication directly in web browsers.
- **Websockets**: Enables bidirectional communication between clients and the server.
- **Socket.IO**: Provides real-time communication between the server and clients.
- **Flask**: A Python web framework used for building the backend signalling server.
- **HTML/CSS/JavaScript**: Frontend development.
- **Open-relay**: A third party STUN/TURN server used.
- **Redis**: Used to cache meeting and users session data for effective session management.
- **Heroku**: Deployment platform for the application.

### Demo/live link

https://syncvision.live <br>
Create or join a conference room and start a video conference.

### Known bugs

An unidentified bug occasionally disrupts the transmission of video/audio media from a newly joined user to the other users in the room. <br>
<span style="color:red">A simple page refresh fixes this issue for now</span> <br>
We are actively pursuing the underlying cause of the issue and are committed to developing a lasting solution.

### Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make your changes and commit them.
- Push your changes to your fork.
- Submit a pull request.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgments

The WebRTC community for creating an amazing technology that enables web video/audio conferencing.
Flask and Socket.IO for simplifying server-side development.
The ALX SE facilitators for providing the opportunity to develop the necessary skills.
Developers and contributors who helped test this project.

### Contact

For issues, questions, or feedback, please contact <martinsndifon@gmail.com> or <ifeanyichukwuhillary2019@gmail.com>

Thank you for using the WebRTC Video Conferencing App!
