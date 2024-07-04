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

wss.on("connection", (socket) => {
    socket.on("enter_room",(msg) => console.log(msg));
});

server.listen(3000)