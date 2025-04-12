import Order from "../models/Order";
import { User, SafeUser, IUser } from "../models/User";
import { Request, Response } from "express";

import * as bcrypt from "bcrypt"
import { getKeypair } from "../utils/authUtils";
import { createOrderTx, extractPayment } from "../contracts/sui";

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

export const createOrder = async (req: Request, res: Response) => {
    const { buyer, product, password } = req.body //expected information
    //cases to abort operation
    const user = await User.findOne({ email:buyer });
    const farmerExists: boolean = product?.farmer && await User.findById(product.farmer)

    if(!farmerExists || !user){
         res.status(400).json({error: "invalid users"})
    }

    //construct the keypair
    const isMatch = bcrypt.compare(password, user?.password!)
    if (!isMatch)  res.status(400).json({ msg:"Invalid password" })

    //get keypair
    const keypair = await getKeypair(user?.mnemonic!, user?.password!)
    //constructing transaction block
    const payment = await extractPayment(product.price, keypair) //payment coin
    const tx = payment && await createOrderTx(product, payment) //transaction object to be signed

    if (tx){
         res.status(200).json({Transaction:tx})
    }
     res.status(500).json({error:"internal server error"})
}

export const getAll = async (req: Request, res: Response) => {

}