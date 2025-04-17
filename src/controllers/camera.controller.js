const handleCameraChange = async() => {
    await getMedia(camerasSelect.value);
    if(peerConnection) {
        const videoTrack = userStream.getVideoTracks()[0];
        const videoSender = peerConnection.getSenders().find(sender => sender.track.kind == 'video');
        videoSender.replaceTrack(videoTrack);
    }
}

const getMedia = async(deviceId) => {
    const initialConstrains = {
        audio : true,
        video : {facingMode: "user"}, 
    };
    try{
        userStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        )
        userVideo.srcObject = userStream;
        if(deviceId) {
            await getCameras();
        }
    }
    catch(e) {
        console.log(e);
    }
}

const handleMuteClick = (event) => {
    userStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    if(!muted) muted = true
    else muted = false
}

const getCameras = async() => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const camera = devices.filter(devices => devices.kind === "videoinput");
        const currentCamera = userStream.getVideoTracks()[0];
        camera.forEach(camera => {
            const option = document.createElement('option')
            option.value = camera.deviceId
            option.innerText = camera.label;
            if(currentCamera.label == camera.label) {
                option.selected = true;
            }
        cameras.appendChild(option);
    })
    }
    catch(e){
        console.log(e)
    }
}

const handleCameraClick = (event) => {
    userStream.getvideoTracks().forEach(track => track.enabled = !track.enabled);

    if(!cameraOff) {cameraOff = false;}

    else {cameraOff = true;}
}