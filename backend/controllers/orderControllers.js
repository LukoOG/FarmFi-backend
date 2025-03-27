const Order = require("../models/Orders");

exports.get_order = async (req, res) => {
    //adjust according to frontend needs
    const { id, farmer } = req.body
    const order = await Order.find({farmer}).find

    if(!order){
        return res.status(400).json({msg: "Order not found"})
    }
}

exports.create_order = async (req, res) => {
    const {} = req.body //expected information
    //cases to abort operation

    //creatng order
    let order = new Order({
        //pass in necessary fields
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