const socket = io();


const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const userVideo = document.getElementById("userVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
let userStream;

room.hidden = true;

let roomName;

muteBtn.addEventListener("click", handlerMuteClick)

cameraBtn.addEventListener("click", handlerCameraClick)

let muted = false;
let cameraOff = false;

async function getMedia() {
  try{
    userStream = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true,
    });
    userVideo.srcObject = userStream;
    console.log(userStream);
  }
  catch(e){
    console.log(e);
  }
}

function handlerMuteClick(event) {
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
  if(!cameraOff) {
    cameraBtn.innerText = "cameraOff"
    cameraOff = false;
  }
  else {
    cameraBtn.innerText = "cameraOn"
    cameraOff = true;
  }
}

getMedia();

function handleRoomSubmit(event) {
    event.preventDefault();
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


function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknamesubmit);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user,newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
  });
  
  socket.on("bye", (user,newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} left ㅠㅠ`);
  });
  
  socket.on("new_message", addMessage);

  
  socket.on("room_change", console.log);

  socket.on("room_change", (msg) => console.log(msg));

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