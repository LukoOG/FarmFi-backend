import Order, { FarmerPaymentDetail } from "../models/Order";
import { User } from "../models/User";
import { Request, Response } from "express";

import { createOrderTx } from "../contracts/sui";
import { IProduct, Product } from "../models/Product";

const development = process.env.NODE_ENV === 'development'

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
    try{
            const { buyer, products, price, payment } = req.body //expected information
        //cases to abort operation
        const user = await User.findOne({ email:buyer });
        if(!user){
            res.status(400).json({error:"User not found"})
            return
        }
        //construct Order object
        // 1. All product ids
        const productIds = new Set<string>()
        const farmerMap: Record<string, FarmerPaymentDetail> = {}
        for (const product of products){
            productIds.add(product._id)
            const farmerId = product.farmer._id

            if(!farmerMap[farmerId]){

                farmerMap[farmerId] = {
                    farmer: farmerId,
                    suiWalletAddress: user.suiWalletAddress,
                    paymentAmount: 0,
                    quantityMap: {}
                }
                
            }
            //increment product quantity
            farmerMap[farmerId].quantityMap[product._id] = (farmerMap[farmerId].quantityMap[product._id] || 0) + 1;

            farmerMap[farmerId].paymentAmount += product.price

        }

        const orderData = new Order({
            farmerPayments: Object.values(farmerMap),
            buyer: user._id,
            products: Array.from(productIds),
            totalPrice: price,
        })

        await orderData.save()

        const tx = await createOrderTx(user.suiWalletAddress, String(orderData._id), payment, orderData.farmerPayments, orderData.totalPrice) //transaction object to be signed

        if (tx){
            res.status(200).json({
                serializedTransaction: tx, 
                order_id: orderData._id
            })
            return
        }
        res.status(500).json({error:"internal server error"})
    }catch(error){
        res.status(500).json({error:error})
        console.log(error)
        if(development){
            console.log(error)
        }
    }

}

export const getAll = async (req: Request, res: Response) => {

}