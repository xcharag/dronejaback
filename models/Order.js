import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    order: {
        type: Array,
        required: true,
    },
    total: {
        type: Number,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'PENDIENTE'
    },
    methodPayment: {
        type: String,
        default: 'TARJETA'
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

export default mongoose.model('Order', orderSchema);