const socket = io();
const connection = import('./connection.js')
const camera = import('./camera.js')
// npm i -g localtunnel
//lt --port 3000
const welcome = document.getElementById("welcome");
const nickname = document.getElementById("name");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const userVideo = document.getElementById("userVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameras = document.getElementById("cameras");
const call = document.getElementById("call");

let userStream;
let peerConnection = connection.MakeConnection;
let dataChannel;
let userNickname = "userjointest";

connection.handleAddStream;
connection.handleIce;
room.hidden = true;
call.hidden = true;

let roomName;

muteBtn.addEventListener("click", handlerMuteClick)

cameraBtn.addEventListener("click", handlerCameraClick)

cameras.addEventListener("input",handleCameraChange);

let muted = false;
let cameraOff = false;

async function stratMedia() {
  room.hidden = false;
  call.hidden = false;
  // await getMedia();
  await camera.getMedia;
  console.log('function active')
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if(peerConnection){
    const videoTrack = userStream.getVideoTracks()[0];
    const videoSender = peerConnection
      .getSenders()
      .find(sender => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
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
      await camera.getCameras;
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


async function handleRoomSubmit(event) {
    event.preventDefault();
    await stratMedia();
    console.log(userStream)
    const input = welcome.querySelector("input");
    console.log(input);
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
    joinUser();
    }
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    addMessage(`you: ${value}`);
    dataChannel.send(`${userNickname} : ${value}`);
    input.value = "";
    }

function handleNicknamesubmit(event) {
    event.preventDefault();
    const input = nickname.querySelector("input");
    console.log(input)
    const value = input.value;
    userNickname = value;
    console.log(input)
    }

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
    }

async function joinUser() {
  console.log('test start');
}

async function showRoom() {
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("ice", ice => {
  console.log("receive ice");
  peerConnection.addIceCandidate(ice);
})

socket.on("welcome", async(user,newCount) => {
    dataChannel = peerConnection.createDataChannel("chat");
    dataChannel.addEventListener("message", (event) => addMessage(event.data));
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    console.log("send offer");
    socket.emit("offer", offer, roomName);
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
  });

socket.on("offer", async(offer)=> {
  peerConnection.addEventListener("datachannel", (event) => {
    dataChannel = event.channel;
    dataChannel.addEventListener("message", (event) => {
      addMessage(event.data)
    })
  });
  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
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