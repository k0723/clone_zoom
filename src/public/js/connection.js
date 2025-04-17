const socket = io();

const MakeConnection = async() => {
    peerConnection = new RTCPeerConnection({
      iceServers: [
        { 
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ]
        }
      ]
    });
    peerConnection.addEventListener("icecandidate", handleIce);
    peerConnection.addEventListener("addstream",handleAddStream);
    userStream
    .getTracks()
    .forEach();
}

const handleAddStream = (data) => {
    const peerStream = documnet.getElementById("peerStream");
    peerStream.srcObject = data.stream;
}

const handleIce = (data) => {
  socket.emit("ice",data.candidate, roomName);
}