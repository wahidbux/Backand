import mongoose from "mongoose";

const playListSchema = new mongoose.Schema({

    name:{
        type: String,
        requird: true,
    },
    description:{
        type: String,
        requird: true 
    },
    video:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
        }
    ],
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

export const PlayList = mongoose.model("PlayList", playListSchema);