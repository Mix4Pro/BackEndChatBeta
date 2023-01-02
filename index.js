const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io")
require("dotenv").config()
const cors = require('cors')
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin: "https://wonderful-moxie-2a9d5c.netlify.app",
        mathods: ["GET", "POST"]
    }
})

io.on('connection', (socket)=>{
    console.log(`User : ${socket.id} connected`)
    socket.on("login", (username,socketID)=>{
        socket.emit("parse_user", `${username}`, `${socketID}`);
    })


    socket.on('send_message', (data)=>{
        socket.broadcast.emit('recieve_message', data)
    })

    socket.on('disconnect', ()=>{
        console.log(`User : ${socket.id} disconnected`)
    })
})

server.listen(process.env.PORT || "https://chatbeta.onrender.com", ()=>{
    console.log("Server is running")
})