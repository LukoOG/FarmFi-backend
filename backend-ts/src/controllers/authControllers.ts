import { Request, Response } from "express";
import { decryptMnemonic, encryptMnemonic, getKeypair } from "../utils/authUtils";
import crypto from  "crypto"

import * as bcrypt from "bcrypt"
import * as bip39 from "bip39"
import * as jwt from "jsonwebtoken"
import {
    genAddressSeed,
    generateNonce,
    generateRandomness,
    jwtToAddress,
    getZkLoginSignature,
    getExtendedEphemeralPublicKey,
} from "@mysten/sui/zklogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { derivePath } from "ed25519-hd-key";

import { User, IUser, SafeUser, IZkLoginInfo } from "../models/User";
import { startSession, Error } from "mongoose";

import "dotenv/config";
import { Farm } from "../models/Farm";


const development = process.env.NODE_ENV === 'development'

export const register = async (req: Request, res: Response) => {
    const session = await startSession();
    try{
        // const { name, email, password, role }= req.body
        const { firstName, lastName, email, phoneNumber, password, role, nin, state, address } = req.body;

        if(!email || !password){
            await session.endSession();
            res.status(400).json({ msg: "Email and password are required" });
            return;
        }

        let existingUser = await User.findOne({ email }).session(session);
        if (existingUser){ 
            await session.endSession();
            res.status(400).json({ msg: "User already exists" });
            return;
        };

        
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

        //other definitions
        const fullname = `${firstName} ${lastName}`
        const location = {
            home: address,
            state: state
        }

        const userData = new User({
            name: fullname,
            email,
            phone: phoneNumber,
            password: hashedPassword,
            role,
            NIN: nin,
            location,
            mnemonic: encryptMnemonic(mnemonic, password), //store the encrypted mnemonic
            imgUrl: "https://res.cloudinary.com/dfxieiol1/image/upload/v1748355861/default-pici_rxkswj.png", //default profile picture
            suiWalletAddress,
            farms: role === "farmer" ? [] : null
        });
        
        
        
        session.startTransaction();
        const newUser = await userData.save({ session });
        
        //Saving the farm if the user is a farmer
        if(role === "farmer"){
            const { type, size, address,  } = req.body.farm
            const farm = await new Farm({
                type,
                size,
                crops: req.body.farm.crops || [],
                location: address,
                farmer: newUser._id,    
            }).save({ session })
            
            await User.findByIdAndUpdate(
                newUser._id,
                { $push: { farms: farm._id } },
                { session }
            );
        }

        await session.commitTransaction()
        
        //generate jwt-token
        let userObj: SafeUser = newUser.toJSON()
        const payload = { user: userObj };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "7d" });
    
        res.json({ token, mnemonic });
        
    } catch(error){
        if(development){
            console.log("this is the: ",error);
        }

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (error instanceof Error.ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        } else{
        res.status(500).json({
            error:"Registeration failed",
            details: development ? error : undefined
        })

        }

    } finally {
        await session.endSession()
    }
}

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body
        
        //get the user
        const user = await User.findOne({email}) as IUser
        if (!user)  res.status(400).json({ msg: "User does not exist" });

        //check password
        const isMatch = bcrypt.compare(password, user.password as string)
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

export const updateProfile = async (req:Request, res:Response) => {
    try{
        // console.log(req)
        if (req.file && req.file.path){
            req.body.imgUrl = req.file.path
        }
        
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!updated) {res.status(400).json({error:"no user found"}); return}
        res.status(200).json({msg:"user profile updated", user:updated})
    } catch(error){
        console.log(error)
        res.status(500).json({ error: error})
    }
}


export const refresh_token = async () => {

}

//development testing. Sending keypair bytes
//bad practice. Keypair derivation will happen client-side
export const getkeypair = async (req: Request, res:Response) => {
    try{
        const { email, password } = req.body

        //get the user
        const user = await User.findOne({email}) as IUser
        if (!user){
            res.status(400).json({ msg: "User does not exist" })
            return;
        };
        
        const isMatch = bcrypt.compare(password, user.password as string)
        if (!isMatch){
            res.status(400).json({ msg:"Invalid credentials" })
            return;
        }

        const keypair = await getKeypair(user.mnemonic as string, password)

        //coding to bytes
        const secretKey = keypair.getSecretKey(); // bech 32 encoded secet key

        res.status(200).json({keypair: secretKey})
        return
    } catch(error){
        res.status(500).json({error:"error getting user keypair"})
        console.log(error)
    }
}

export const getmnemonic = async (req: Request, res:Response) => {
    try{
        const { email, password } = req.body

        //get the user
        const user = await User.findOne({email}) as IUser
        if (!user){
            res.status(400).json({ msg: "User does not exist" })
            return;
        };
        
        const isMatch = bcrypt.compare(password, user.password as string)
        if (!isMatch){
            res.status(400).json({ msg:"Invalid credentials" })
            return;
        }

        const mnemonic = user.mnemonic
        res.status(200).json({mnemonic})
        return
    } catch(error){
        res.status(500).json({error:"error getting user keypair"})
        console.log(error)
    }
}
/* 
The zklogin workflow is in two parts A and B

A(Address derivation)
i. After receiving jwt payload from oauth provider we retrieve the iss, sub and aud
ii. Generate an Ephemeral keypair(eKP) for signing transactions stored in sesion, the max epoch(mE) which is the validity
    period of the ephemeral keypair and randomness from te provided generateRandomness function of mysten labs
    note: (1 epoch ~= 24h)
iii.  We then generate nonce using the 3 parameters from step 2. Note: we use the public key from .getPublicKey() and
        not the whole keypair
iv. We compute a salt which will be associated with the zklogin address. Note: this is similar to mnemonics, if lost, the
    addres is also lost.
v. Finally we provide the jwtpayload and salt to the jwtToAddress function from mysten labs to generate their address

Note: nonce is given to the oauth provider to generate the jwt...frontend implementation
B.(Signing transactions)
i.  We first get the zkproof using the extended ephemeral keypair of the generated keypair (eKP) from earlier or a new keypair
    and send a request to Sui's backed servce to get get the proof as so:  
    const zkProofResult = await axios.post(
  "https://prover-dev.mystenlabs.com/v1",
  {
    jwt: oauthParams?.id_token as string,
    extendedEphemeralPublicKey: extendedEphemeralPublicKey,
    maxEpoch: maxEpoch,
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: "sub",
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
).data;

const partialZkLoginSignature = zkProofResult as PartialZkLoginSignature

ii. We then assemble the signature using an address seed gotten from the jwt payload and salt, the maxepoch, usersignature
    from ephemeral keypair and the partialzklogn signature. After assembling the signature we can then execute a transaction
    block with it.
    Note: Each ZK Proof is associated with an ephemeral key pair. Stored in the appropriate location, 
    it can be reused as proof to sign any number of transactions until the ephemeral key pair expires.
 */
type OauthPayload = {
    provider: string,
    sub: string,
    aud: string,
    [key: string]: any // for all the other JWT fields
}

export const generateSalt =  (): string => {
    const buf = crypto.randomBytes(16);
    const salt = BigInt('0x' + buf.toString('hex'));
    return salt.toString(); // decimal string
}

const signTransaction = async () => {

}