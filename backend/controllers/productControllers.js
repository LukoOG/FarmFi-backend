const Product = require("../models/Products")
const upload = require("../middleware/upload")
/*
Tasks
1. Get a Product: i. by Id ii. by Category
2. Create product
3. Update product
4. Delete product
*/

//1. create product
exports.create_product = async (req, res) => {
    const { name, description, price, stock, category, farmer, weight} = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const product = new Product({
        name,
        description,
        price,
        stock,
        farmer,
        category,
        weight,
        imgUrl: imageUrl,
    })
    await product.save()
    res.status(200).json({product})
}

//2. get product: by ID and all
exports.get_All = async (req, res) => {
    try{
        const products = await Product.find().populate("farmer","name")
        res.json(products)
    } catch(error){
        res.status(500).json({error:error})
    }
}

exports.get_id = async ( req, res ) => {
    try{
        const product = await Product.findById(req.params.id).populate("farmer")
        if (!product) res.status(400).json({error:"Product not found"})
        res.status(200).json({product})
    } catch(error){
        res.status(500).json({ error: error });
    }
}

exports.update_product = async( req, res) => {
    try{
        const product = Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    } catch(error){
        res.status(500).json({ error: error})
    }
}

exports.delete_product = async( req, res ) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}