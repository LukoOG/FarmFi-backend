import Order from "../models/Order";
import { User, SafeUser, IUser } from "../models/User";
import { Request, Response } from "express";

import * as bcrypt from "bcrypt"
import { getKeypair } from "../utils/authUtils";
import { createOrderTx, extractPayment } from "../contracts/sui";
import { IProduct, Product } from "../models/Product";

export const getOrder = async (req: Request, res: Response) => {
    //adjust according to frontend needs
    try{
        const order = await Order.findById( req.params.id )

        if(!order){
            res.status(400).json({msg: "Order not found"})
        }
        res.status(200).json({order})
    } catch(err:unknown){
        console.log(err)
        res.status(400).json({error:err})
    }
}

//ability to process multpled products from different farmers
export const createOrder = async (req: Request, res: Response) => {
    const { buyer, product, password } = req.body //expected information
    //cases to abort operation
    const user = await User.findOne({ email:buyer }) as IUser;
    const farmerExists: boolean = product?.farmer && await User.findById(product.farmer)

    if(!farmerExists || !user){
        res.status(400).json({error: "invalid users"})
        return;
    }

    const prod = await Product.findById(product._id)

    const order = new Order({
        farmer: product.farmer,
        buyer:  user.id,
        product: [prod?.id],
        totalPrice: 12,

    })

    await order.save()
    let order_id = order.id

    //construct the keypair
    const isMatch = await bcrypt.compare(password, user?.password!)
    if (!isMatch){  res.status(400).json({ msg:"Invalid password" }); return}

    //get keypair; frontend should deal with extracting payment coin to maintaini decentralization
    const keypair = await getKeypair(user?.mnemonic!, password)
    //constructing transaction block
    const payment = await extractPayment(product.price, keypair) //payment coin
    if(!payment){
        res.status(200).json({error:"not enough funds"})
        return;
    }
    const tx = payment && await createOrderTx(product, order_id, payment,keypair) //transaction object to be signed

    if (tx){
        // const serializedTx = await tx.toJSON()
        // res.status(200).json({serializedTransaction: serializedTx})
        res.status(200).json({serializedTransaction: tx})
        return
    }
    res.status(500).json({error:"internal server error"})
}

export const getAll = async (req: Request, res: Response) => {

}