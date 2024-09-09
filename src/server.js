import http from "http";
import express from "express"
import SocketIO from "socket.io";

const app = express();

app.set('view engine', 'pug');
app.set ("views", __dirname +"/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/",(_,res) => res.redirect("/"));


app.get("/", (req, res) => res.render("home"));

const server = http.createServer(app);
const wss = SocketIO(server);

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

wss.on("connection", (socket) => {
    socket.on("enter_room",(roomName, done) => {
        console.log(roomName);
        socket.join(roomName);
        done();
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
          socket.to(room).emit("bye", socket.nickname)
        );
      });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
      });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

server.listen(3000)