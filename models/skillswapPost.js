import mongoose from "mongoose";

const SkillSwapPostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    OfferedSkill:{
        type : String,
        required : true
    },
    status:{
        type: String,
        enum: ['open','ongoing' ,'closed'],
        default: 'open'
    },
    WantedSkill:{
        type : String,
        required : true
    },
    description : {
        type : String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SkillSwapPost = mongoose.model("SkillSwapPost",SkillSwapPostSchema);

export default SkillSwapPost;