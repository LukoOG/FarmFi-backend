const mongoose = require("mongoose")

const categories =[
    "Staple",
    "Cash",
    "Others",
]

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //reference to the farmer
    price: { type: Number, required: true, default:0},
    description: { type: String },
    category: {type: String, enum: categories, required:true},
    weight: { type: Number, required:true },
    imgUrl: { type: String },
    available: { type: Boolean, required:true, default:true},
})

module.exports = mongoose.model("Product", ProductSchema);
