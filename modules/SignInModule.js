import mongoose from "mongoose";

const signinSchema = new mongoose.Schema({
    username: String,
    password: String
})

export default mongoose.model("SignIn",signinSchema);