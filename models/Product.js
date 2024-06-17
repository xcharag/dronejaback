import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    stock:{
        type: Number,
        required: true,
    },
    price:{
        type: Number,
        required: true
    },
    created:{
        type: Date,
        default: Date.now(),
        required: true,
    }
});

export default mongoose.model('Product', productSchema);