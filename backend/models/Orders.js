const mongoose = require("mongoose")
const Product = require("./Products")

const status = [
    "Pending",
    "Completed",
    "Cancelled",
]

const OrderSchema = new mongoose.Schema({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    totalPrice: { type: Number, required: true },
    status: {type: String, enum:status, required: true, default: "Pending"},
    escrowTxHash: { type: String } //Order transaction hash on-chain
}, { timestamps: true })

module.exports = mongoose.model("Order", OrderSchema)