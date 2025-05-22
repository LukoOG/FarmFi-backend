import { Product, IProduct } from "../models/Product";
import { Request, Response } from "express";

//api endpoints
export const createProduct = async(req: Request, res: Response) => {
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

export const createMultipleProducts = async(req: Request, res: Response) => {
    try{
        const products = req.body;
        const files = req.files as Express.Multer.File[];

        if(!Array.isArray(products) || !files || products.length !== files.length){
            res.status(400).json({"error": "Mismatch between products and images"})
            return
        }

        for(let i=0; i<=products.length; i++){
            const image = files[i].path;
            const productData = products[i]

            const newProduct = new Product({
                ...productData,
                imgUrl: image
            })
            await newProduct.save()
        }

        res.status(201).json({ msg: "successfully saved all products" });
    } catch(error){
        res.status(500).json({ error: "saving multiple products"})
    }
}

export const getAll = async (req: Request, res: Response) => {
    try{
        const products = await Product.find().populate("farmer","name")
        res.json(products)
    } catch(error){
        res.status(500).json({error:error})
    }
}
export const getByID = async (req:Request, res:Response) => {
    try{
        const product = await Product.findById(req.params.id).populate("farmer")
        if (!product) res.status(400).json({error:"Product not found"})
        res.status(200).json({product})
    } catch(error){
        res.status(500).json({ error: error });
    }
}
export const updateProduct = async (req:Request, res:Response) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        console.log(req.body)
        if (!product) {res.status(400).json({error:"no product found"}); return}
        res.status(200).json({msg:"product updated", product:product})
    } catch(error){
        res.status(500).json({ error: error})
    }
}

export const deleteProduct = async (req:Request, res:Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {res.status(400).json({error:"no product found"}); return}
        res.status(200).json({msg:"product deleted"})
    } catch (err: unknown) {
        console.log( err );
    }
}