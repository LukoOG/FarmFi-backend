const Order = require("../models/Orders");
const User = require("../models/Users");
const Contracts = require("../contracts/sui")

exports.get_order = async (req, res) => {
    //adjust according to frontend needs
    const { farmer } = req.body
    const order = await Order.find({farmer}).find

    if(!order){
        return res.status(400).json({msg: "Order not found"})
    }
}

exports.create_order = async (req, res) => {
    const { farmer, buyer, product, totalPrice } = req.body //expected information
    //cases to abort operation
    if(!User.findById(farmer) || !User.findById(buyer)) res.status(400).json({error: "invalid users"})

    //creating onchain transaction and retrieving escrow hash
    const escrow = Contracts.;
    //creatng order
    let order = new Order({
        farmer,
        buyer,
        product,
        totalPrice,
        escrow: escrow

    })
    res.status(200).json({msg:"Order successfuly created"})
}

exports.cancel_order = async (req, res) => {
    return
}

// exports.list_all = async (req, res) => {
//     const { buyer, farmer } = req.body
//     if()
// }