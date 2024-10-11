const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io")
const fs = require('fs')
const mongoose = require("mongoose")
const BodyParser = require('body-parser')
require("dotenv").config()
const cors = require('cors');
const crypto = require("crypto");
require('dotenv').config()
app.use(BodyParser.urlencoded({extended:false}))
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors({
    origin: '*',
    methods: ["GET", "POST"]
}))

let currentUser;
let key = process.env.KEY
// let iv = crypto.randomBytes(Number(process.env.IV_NUMBER))
let iv = Buffer.alloc(16,0)

const server = http.createServer(app)
// origin: "https://wonderful-moxie-2a9d5c.netlify.app", 
// mongodb+srv://user:user@cluster0.pbwjquf.mongodb.net/?retryWrites=true&w=majority
// https://frontchatbeta.netlify.app

//     {useNewUrlParser: true,useUnifiedTopology: true}

const io = new Server(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]
    }
})


mongoose.set('strictQuery', false);
mongoose.connect(
    'mongodb+srv://mix4pro:12345678910@cluster0.mmrqmaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {useNewUrlParser: true,useUnifiedTopology: true}
)

const signinSchema = new mongoose.Schema({
    username: String,
    password: String
})

const messagesSchema = new mongoose.Schema({
    author: String,
    message: String,
    date: String,
    image: String
})

const SignIn = mongoose.model('SignIn', signinSchema)
const Messages = mongoose.model('Message', messagesSchema)

io.on('connection', (socket)=>{
    console.log(`User : ${socket.id} connected`)
    socket.on("login", (username,socketID)=>{
        socket.emit("parse_user", `${username}`, `${socketID}`);
    })

    socket.on('send_message', (messages)=>{
        socket.broadcast.emit('recieve_message', messages)
    })

    socket.on('disconnect', ()=>{
        console.log(`User : ${socket.id} disconnected`)
    })
})


let passwordEncrypt = (password) =>{
    let cipher = crypto.createCipheriv('aes-256-cbc',process.env.KEY,iv)
    let encrypted_password = cipher.update(password,'utf-8','hex')
    encrypted_password += cipher.final('hex')

    return encrypted_password
}

server.listen(3001,()=>{
    console.log("Server is running")
})
// app.get('/',(req,res)=>{

//     // let cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
//     // let encrypted = cipher.update(name,'utf-8','hex')
//     // encrypted += cipher.final('hex')
    
//     SignIn.find(async (err,data)=>{
//         if(err){
//             console.log(err)
//         }else{
//             if(data !== null){
//                 // SignIn.updateOne(data.usernm)

//                 await data.forEach(async (val)=>{
//                     let cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
//                     let encrypted_password = cipher.update(val.password,'utf-8','hex')
//                     encrypted_password += cipher.final('hex')
//                     console.log(val.username,encrypted_password)
//                     await SignIn.updateOne({username:val.username},{
//                         $set:{
//                             password: encrypted_password
//                         }
//                     })
//                 })
//             }else{
//                 res.sendStatus(303)
//             }
//         }
//     })   
// })
app.get('/chat-get-messages',async (req,res)=>{
    let messages = await Messages.find({})
    res.status(200).send(messages)
})

app.post('/', (req,res)=>{
    let encryptedPassword_LOG_IN = passwordEncrypt(req.body.password)
    console.log(encryptedPassword_LOG_IN)
    let user = {
        username: req.body.username,
        password: encryptedPassword_LOG_IN
    }
    SignIn.findOne({
        username: user.username,
        password: user.password
    },(err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data !== null){
                res.sendStatus(200)
                currentUser = data.username
            }else{
                res.sendStatus(303)
            }
        }
    })
})

app.post('/chat-insert-message',(req,res)=>{
    let message = {
        author: req.body.author,
        message: req.body.message,
        date: req.body.date,
        image: req.body.image
    }
    Messages.collection.insertOne(message,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Message is inserted to the DataBase XD")
        }
    })

    res.sendStatus(200)
})

app.post('/registration',(req,res)=>{
    let encryptedPassword_SIGN_IN = passwordEncrypt(req.body.password)
    console.log(encryptedPassword_SIGN_IN)
    let regUser = {
        username: req.body.username,
        password: encryptedPassword_SIGN_IN
    }
    
    SignIn.findOne({
        username: regUser.username
    },(err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data !== null){
                res.sendStatus(303)
            }else{
                SignIn.collection.insertOne(regUser,(err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log("Data is inserted")
                        currentUser = regUser.username
                        res.sendStatus(200)
                    }
                })  
            }
        }
    })
})
1
app.get('/delete', (req,res)=>{
    SignIn.deleteMany((query)=>{
        console.log('Accounts have been deleted')
    })

    Messages.deleteMany((query)=>{
        console.log('Messages have been deleted')
    })

    res.send(['Accounts have been deleted','Messages have been deleted'])
})

app.get('/encrypt',(req,res)=>{
    SignIn.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            console.log(data.length)
            if(data !== null && data.length !== 0){
                data.forEach((val)=>{
                    let decipher = crypto.createDecipheriv('aes-256-cbc',process.env.KEY,iv)
                    let decrypt = decipher.update(val.password,'hex','utf-8')
                    decrypt += decipher.final("utf-8")
    
                    console.log(decrypt)
                    
                    res.send(`${val.username} : ${decrypt}`)
                })
            }else{
                res.send(404)
            }
        }
    })
})