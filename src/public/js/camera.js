const room = document.getElementById("room");
const call = document.getElementById("call");
const cameras = document.getElementById("cameras");
const userVideo = document.getElementById("userVideo");
let userStream


const startMedia = async() =>{
    room.hidden = false;
    call.hidden = false;
    await getMedia();
}

const getMedia = async(deviceId) => {
    console.log("file");
    const initialConstrains = {
      audio: true,
      video: {facingMode: "user"},
    };
    const cameraConstraints = {
      audio:true,
      video : { deviceId : {exact: deviceId}},
    };
    try{
      userStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstrains
      );
      userVideo.srcObject = userStream;
      if(!deviceId) {
        await getCameras();
      }
    }
    catch(e){
      console.log(e);
    }
    console.log(userStream)
  }

  const getCameras = async() => {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const camera = devices.filter(devices => devices.kind === "videoinput");
        const currentCamera = userStream.getVideoTracks()[0];
        camera.forEach(camera => {
          const option = document.createElement("option")
          option.value = camera.deviceId
          option.innerText = camera.label;
          if(currentCamera.label == camera.label){
            option.selected = true;
          }
          cameras.appendChild(option);
        })
      }
      catch(e){
        console.log(e);
      }
  }