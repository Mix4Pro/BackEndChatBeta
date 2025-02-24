import EncryptServices from "../services/EncryptServices.js";
import SignInModule from "../modules/SignInModule.js";

class SignInController{
    async signIn(req,res){
        try{
            let encryptedPassword_LOG_IN = EncryptServices(req.body.password)
            let user = {
                username: req.body.username,
                password: encryptedPassword_LOG_IN
            }
            let data = await SignInModule.findOne({
                username: user.username,
                password: user.password
            });

            if(data === null){
                return false;
            }
            return true;
        }catch(error){
            throw new Error(error);
        }
    }

    async signUp(req,res){
        try{
            let encryptedPassword_SIGN_IN = EncryptServices(req.body.password)
            console.log(encryptedPassword_SIGN_IN)
            let regUser = {
                username: req.body.username,
                password: encryptedPassword_SIGN_IN
            }
            let data = await SignInModule.findOne({
                username: regUser.username
            })
            console.log(data);
            if(data !== null){
                return false;
            }else{
                let insertedData = await SignInModule.collection.insertOne(regUser);
                console.log(insertedData.acknowledged);
                if(insertedData.acknowledged){
                    console.log("Data is inserted");
                    return 1;
                }else{
                    return 2;
                }
            }
        }catch(error){
            throw new Error(error);
        }
        
    }
}

export default new SignInController;