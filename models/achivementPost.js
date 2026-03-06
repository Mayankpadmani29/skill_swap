import mongoose from "mongoose";

const AchivmentPostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:{
        type : String,
        required : true
    },
    description : {
        type : String,
        required: true,
    },
    tag :{
        type : [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AchivmentPost = mongoose.model("AchivmentPost",AchivmentPostSchema);

export default AchivmentPost;