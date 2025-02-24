import mongoose, { mongo } from "mongoose";

const messagesSchema = new mongoose.Schema({
    author: String,
    message: String,
    date: String,
    image: String
})

export default mongoose.model("Message",messagesSchema);