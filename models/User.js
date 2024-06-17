import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    role:{
        type: String,
        required: true,
        trim: true
    },
    associatedSeller:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    created:{
        type: Date,
        default: Date.now(),
        required: true,
    }
});

export default mongoose.model('User', userSchema);