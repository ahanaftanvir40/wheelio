import mongoose from "mongoose";
import config from 'config'
import dbgr from 'debug'



//"MONGODB_URI": "mongodb://localhost:27017/wheelzonrent"
mongoose.connect('mongodb+srv://ahanaf:superuser@cluster0.zurgxzj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log(`connected`) //add dbgr later
    })
    .catch((err) => {
        console.log(err);
        
    })

export const db = mongoose.connection