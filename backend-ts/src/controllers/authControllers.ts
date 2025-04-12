import { Request, Response } from "express";
import { decryptMnemonic, encryptMnemonic } from "../utils/authUtils";

import * as bcrypt from "bcrypt"
import * as bip39 from "bip39"
import * as jwt from "jsonwebtoken"

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { derivePath } from "ed25519-hd-key";

import { User, IUser, SafeUser } from "../models/User";

import "dotenv/config";

export const register = async (req: Request, res: Response) => {
    try{
        const { name, email, password, role }= req.body

        let user = await User.findOne({ email });
        if (user)  res.status(400).json({ msg: "User already exists" });

        //hashing the password
        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(password, salt);

        //generate mnemonic
        const mnemonic = bip39.generateMnemonic();
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const path = "m/44'/784'/0'/0'/0'"; // Standard for Sui wallets
        const derivedKey = derivePath(path, seed.toString("hex")).key;
    
        //generating their wallet
        const keypair = Ed25519Keypair.fromSecretKey(derivedKey);
        const suiWalletAddress = keypair.toSuiAddress();

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            mnemonic: encryptMnemonic(mnemonic, password), //store the encrypted mnemonic
            suiWalletAddress
        })
        await user.save()
        let userObj: SafeUser = user.toJSON()

        //generate jwt-token
        const payload = { user: userObj };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "7d" });
    
        res.json({ token, mnemonic });
        
    } catch(err){
         res.status(400).json({error:err})
    }
}

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body
        
        //get the user
        const user = await User.findOne({email}) as IUser
        if (!user)  res.status(400).json({ msg: "User does not exist" });

        //check password
        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch)  res.status(400).json({ msg:"Invalid credentials" })

        let userObj = user.toJSON() as SafeUser
        
        //generate token
        const payload = { user: userObj };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,  // Set to true in production (requires HTTPS)
            sameSite: "none",
            maxAge: 3600000, // 1 hour
        });


        res.status(200).json({token})

    }catch(error){
        console.log(error)
        res.status(500).send("Server error");
    }
}