import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
let key = process.env.KEY
let iv = Buffer.alloc(16,0);

let DecryptServices = (val) =>{
    let decipher = crypto.createDecipheriv('aes-256-cbc',key,iv);
    let decrypt = decipher.update(val.password,'hex','utf-8');
    decrypt += decipher.final("utf-8");
    let username = val.username;
    let password = decrypt;

    return [username,password];
}

export default DecryptServices;