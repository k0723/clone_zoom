const socket = io();


const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const userVideo = document.getElementById("userVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameras = document.getElementById("cameras");
const call = document.getElementById("call");
let userStream;
let peerConnection;

room.hidden = true;
call.hidden = true;

let roomName;

muteBtn.addEventListener("click", handlerMuteClick)

cameraBtn.addEventListener("click", handlerCameraClick)

cameras.addEventListener("input",handleCameraChange);

let muted = false;
let cameraOff = false;


async function MakeConnection() {
  peerConnection = new RTCPeerConnection();
  peerConnection.addEventListener("icecandidate", handleIce);
  peerConnection.addEventListener("addstream",handleAddStream);
  userStream
  .getTracks()
  .forEach(track => peerConnection.addTrack(track, userStream));
  console.log(userStream.getTracks());
}
function handleAddStream(data) {
  const peerStream = document.getElementById("peerStream");
  console.log(data.stream);
  peerStream.srcObject = data.stream;
}
function handleIce(data) {
  socket.emit("ice",data.candidate, roomName);
}
async function stratMedia() {
  room.hidden = false;
  call.hidden = false;
  await getMedia();
  MakeConnection();
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if(peerConnection){
    console.log(peerConnection.getSenders())
  }
}

async function getMedia(deviceId) {
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
}

function handlerMuteClick(event) {
  userStream
    .getAudioTracks()
    .forEach(track => track.enabled = !track.enabled);
  
  if(!muted) {
    muteBtn.innerText = "Unmute"
    muted = true;
  }
  else {
    muteBtn.innerText = "Mute"
    muted = false;
  }
}

async function getCameras(){
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

function handlerCameraClick(event) {
  userStream
    .getVideoTracks()
    .forEach(track => track.enabled = !track.enabled);
  
  if(!cameraOff) {
    cameraBtn.innerText = "cameraOff"
    cameraOff = false;
  }
  else {
    cameraBtn.innerText = "cameraOn"
    cameraOff = true;
  }
}


function handleAddStream(data) {
  const peersStream = document.getElementById("peerStream");
  peersStream.srcObject= data.stream;
}
async function handleRoomSubmit(event) {
    event.preventDefault();
    await stratMedia();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";

    }
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
      addMessage(`You: ${value}`);
    });
    input.value = "";
    }

function handleNicknamesubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", input.value);
    }

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
    }


async function showRoom() {
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknamesubmit);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("ice", ice => {
  console.log("receive ice");
  peerConnection.addIceCandidate(ice);
})

socket.on("welcome", async(user,newCount) => {
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    console.log("send offer");
    socket.emit("offer", offer, roomName);
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
  });

socket.on("offer", async(offer)=> {
  peerConnection.setRemoteDescription(offer);
  console.log(offer);
  const answer = await peerConnection.createAnswer();
  console.log(answer);
  peerConnection.setLocalDescription(answer);
  socket.emit("answer",answer, roomName);
})

socket.on("answer", answer => {
  peerConnection.setRemoteDescription(answer);
})
  
  socket.on("bye", (user,newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} left ㅠㅠ`);
  });
  
  socket.on("new_message", addMessage);

  socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    if(rooms.length === 0 ) {
      roomList.innerHTML = "";
      return;
    }
    rooms.forEach(room => {
      const li = document.createElement("li");
      li.innerText = room;
      roomList.append(li);
    });
  });