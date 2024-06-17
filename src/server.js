import http from "http";
import express from "express"
import WebSocket from "ws";

const app = express();

app.set('view engine', 'pug');
app.set ("views", __dirname +"/views");
app.use("/public", express.static(__dirname + "/public"));


app.get("/", (req, res) => res.render("home"));

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

server.listen(3000)