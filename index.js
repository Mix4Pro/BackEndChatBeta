import express from "express";
import http from "http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import BodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import SignInModule from "./modules/SignInModule.js";
import MessagesModule from "./modules/MessagesModule.js";
import MessagesController from "./controllers/MessagesController.js";
import CryptoServices from "./services/CryptoServices.js";
dotenv.config();
const app = express();
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
    let cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
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
    let messages = await MessagesController.getAllMessages(req,res);

    res.status(200).send(messages);
})

app.post('/', (req,res)=>{
    let encryptedPassword_LOG_IN = CryptoServices(req.body.password)
    console.log(encryptedPassword_LOG_IN)
    let user = {
        username: req.body.username,
        password: encryptedPassword_LOG_IN
    }
    SignInModule.findOne({
        username: user.username,
        password: user.password
    },(err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data !== null){
                res.status(200).json("Access");
                currentUser = data.username;
            }else{
                res.status(303).json("Username Or Password Is Incorrect");
            }
        }
    })
})

app.post('/chat-insert-message',async (req,res)=>{
    await MessagesController.insertOneMessage(req,res);

    res.status(200).json("Inserted SUCCESSFULLY");
})

app.post('/registration',(req,res)=>{
    let encryptedPassword_SIGN_IN = passwordEncrypt(req.body.password)
    console.log(encryptedPassword_SIGN_IN)
    let regUser = {
        username: req.body.username,
        password: encryptedPassword_SIGN_IN
    }
    
    SignInModule.findOne({
        username: regUser.username
    },(err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data !== null){
                res.sendStatus(303)
            }else{
                SignInModule.collection.insertOne(regUser,(err)=>{
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
    SignInModule.deleteMany((query)=>{
        console.log('Accounts have been deleted')
    })

    MessagesModule.deleteMany((query)=>{
        console.log('Messages have been deleted')
    })

    res.send(['Accounts have been deleted','Messages have been deleted'])
})

app.get('/encrypt',(req,res)=>{
    SignInModule.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            console.log(data.length)
            if(data !== null && data.length !== 0){
                let decryptedArray = [];
                data.forEach((val)=>{
                    let decipher = crypto.createDecipheriv('aes-256-cbc',key,iv)
                    let decrypt = decipher.update(val.password,'hex','utf-8')
                    decrypt += decipher.final("utf-8")
                    let username = val.username;
                    let password = decrypt;

                    decryptedArray.push({username,password});
                    console.log(decryptedArray);
                })
                res.status(200).send("Data is decrypted");
            }else{
                res.sendStatus(404);
            }
        }
    })
})