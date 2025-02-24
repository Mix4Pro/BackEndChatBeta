import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// let iv = crypto.randomBytes(Number(process.env.IV_NUMBER))
let key = process.env.KEY
let iv = Buffer.alloc(16,0);

let EncryptServices = (password) =>{
    let cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
    let encrypted_password = cipher.update(password,'utf-8','hex')
    encrypted_password += cipher.final('hex')

    return encrypted_password
}

export default EncryptServices;