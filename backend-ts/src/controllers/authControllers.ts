import { Request, Response } from "express";
import User from "../models/User";


export const register = async (req: Request, res: Response) => {
    try{
        const { name, email, passsword, role }= req.body

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        
    }
}