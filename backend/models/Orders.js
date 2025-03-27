const mongoose = require("mongoose")
const Product = require("./Products")

const status = [
    "Pending",
    "Completed",
    "Cancelled",
]

const OrderSchema = new mongoose.Schema({
    farmer: { type: String, required: true },
    buyer: { type: String, required: true},
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
        required: true,
    },
    price: { type: Number, required: true, default:0},
    status: {type: String, enum:status, required: true},
    escrowID: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("Order", OrderSchema)