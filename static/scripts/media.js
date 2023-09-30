if (navigator.userAgentData.mobile) {
    const presenting = document.getElementById('share_screen_btn');
    presenting.classList.add('no_visible');
    const screenContainer = document.getElementById('screen_container');
    screenContainer.classList.add('no_visible');
}

function createMediaContainer(peerId, stream, username) {
    const container = document.createElement('div');
    container.className = "media_container";
    if (peerId == 'local') {
        container.classList.add('local_media');
        container.classList.add('one_container')
    }
    container.id = `${peerId}_media`;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = "options_container";
    optionsContainer.id = `${peerId}_options`;

    const mic = document.createElement('span');
    mic.className = "material-symbols-outlined options_mic";
    mic.innerText = "mic_off";

    const camera = document.createElement('span');
    camera.className = "material-symbols-outlined options_camera";
    camera.innerText = "videocam_off";

    optionsContainer.append(mic);
    optionsContainer.append(camera);
    container.append(optionsContainer)

    const video = document.createElement('video');
    video.id = `${peerId}_video`;
    video.setAttribute('autoplay', true);
    video.setAttribute('playsinline', true);
    video.srcObject = stream;
    container.append(video);

    const mediaAlt = document.createElement('div');
    mediaAlt.className = "media_alt";
    mediaAlt.id = `${peerId}_alt`;
    const p = document.createElement('p');
    const name = username.split(' ');
    if (name.length > 1) {
        p.textContent = `${name[0][0].toUpperCase()}${name[1][0].toUpperCase()}`;
    } else {
        p.textContent = `${name[0][0].toUpperCase()}`;
    }
    mediaAlt.append(p);
    container.append(mediaAlt);

    if (peerId == 'local') {
        video.muted = true;
        return [video, container];
    }
    return container;

}

function toggleMediaNotice(media, constraints, peerId) {
    const options = document.getElementById(`${peerId}_options`);
    const micOption = options.children[0];
    const cameraOption = options.children[1];
    if (media == 'audio') {
        if (constraints.audio) {
            if (cameraOption.classList.contains('no_visible')) {
                micOption.classList.add('no_visible');
                options.classList.add('no_visible');
            } else {
                micOption.classList.add('no_visible');
            }
        } else {
            if (cameraOption.classList.contains('no_visible')) {
                micOption.classList.remove('no_visible');
                options.classList.remove('no_visible');
            } else {
                micOption.classList.remove('no_visible');
            }
        }
    } else {
        const mediaAlt = document.getElementById(`${peerId}_alt`);
        if (constraints.video) {
            mediaAlt.classList.add('no_visible');
            if (micOption.classList.contains('no_visible')) {
                cameraOption.classList.add('no_visible');
                options.classList.add('no_visible');
            } else {
                cameraOption.classList.add('no_visible');
            }
        } else {
            if (mediaAlt.classList.contains('no_visible')) {
                mediaAlt.classList.remove('no_visible');
            }
            if (micOption.classList.contains('no_visible')) {
                options.classList.remove('no_visible');
                cameraOption.classList.remove('no_visible');
            } else {
                cameraOption.classList.remove('no_visible');
            }
        }
    }
}

function adjustContainers (mediaContainers, remoteContainer, type) {
    const local = document.getElementById('local_media');
    if (type == 'addContainer') {
        if (mediaContainers.children.length == 2) {
          local.classList.add('local_one_container');
          local.classList.remove('one_container');
          remoteContainer.classList.add('one_container');
        } else if (mediaContainers.children.length > 2) {
          const current_one_container = document.querySelector('.one_container');
            if (current_one_container) {
                current_one_container.classList.remove('one_container');
                local.classList.remove('local_one_container');
            }
        }
    } else {
        console.log('readjusting...')
        if (mediaContainers.children.length == 1) {
            local.classList.remove('local_one_container')
            local.classList.add('one_container');
        }
        if (mediaContainers.children.length == 2) {
            Array.from(mediaContainers.children).forEach((container) => {
                if (container.id != "local_media") {
                    container.classList.add('one_container');
                }
            })
            local.classList.remove('one_container');
            local.classList.add('local_one_container');
        }
    }
}