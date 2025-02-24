import MessagesModule from "../modules/MessagesModule.js";

class MessagesController{
    async getAllMessages(req,res){
        let messages = await MessagesModule.find({});
        return messages
    }

    async insertOneMessage(req,res){
        let message = {
            author: req.body.author,
            message: req.body.message,
            date: req.body.date,
            image: req.body.image
        }

        await MessagesModule.collection.insertOne(message,(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Message is inserted to the DataBase XD");
            }
        })
    }
}

export default new MessagesController;