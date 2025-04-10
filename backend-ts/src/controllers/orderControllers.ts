import Order from "../models/Order";
import { Request, Response } from "express";

export const getOrder = async (req: Request, res: Response) => {
    //adjust according to frontend needs
    try{
        const { farmer } = req.body
        const order = await Order.find({farmer}).find

        if(!order){
            return res.status(400).json({msg: "Order not found"})
        }
    } catch(err:unknown){
        console.log(err)
        return res.status(400).json({error:err})
    }
}

export const createOrder = async (req: Request, res: Response) => {

}

export const getAll = async (req: Request, res: Response) => {

}