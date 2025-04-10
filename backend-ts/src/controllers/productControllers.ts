import Product from "../models/Product";
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
        const product = Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    } catch(error){
        res.status(500).json({ error: error})
    }
}

export const deleteProduct = async (req:Request) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return 
    } catch (err: unknown) {
        console.log( err );
    }
}