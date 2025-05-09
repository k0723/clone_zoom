import http from "http";
import express from "express"
import { instrument } from "@socket.io/admin-ui";
import {Server} from "socket.io";

const app = express();

app.set('view engine', 'pug');
app.set ("views", __dirname +"/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/",(_,res) => res.redirect("/"));


app.get("/", (req, res) => res.render("home"));

const httpserver = http.createServer(app);
const wss = new Server(httpserver, {
    cors: {
        origin: ["https://admin.socket.io"],
        Credentials: true,
    },
});
instrument(wss, {
    auth:false
});

function publicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wss;
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wss.sockets.adapter.rooms.get(roomName)?.size
}

wss.on("connection", (socket) => {
    socket.on("enter_room",(roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wss.sockets.emit("room_change", publicRooms());
    });
    socket.on("offer", (offer,roomName)=> {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer,roonName)=> {
        socket.to(roonName).emit("answer",answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice",ice);
    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
          socket.to(room).emit("bye", socket.nickname,countRoom(room)-1)
        );
        wss.sockets.emit("room_change", publicRooms());
      });
    socket.on("disconnect", () => {
        wss.sockets.emit("room_change", publicRooms());
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpserver.listen(3000);