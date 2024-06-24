import http from "http";
import express from "express"
import WebSocket from "ws";

const app = express();

app.set('view engine', 'pug');
app.set ("views", __dirname +"/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/",(_,res) => res.redirect("/"));


app.get("/", (req, res) => res.render("home"));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer",offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice,roomName) => {
        socket.to(roomName).emit("ice",ice);
    });
});

server.listen(3000)