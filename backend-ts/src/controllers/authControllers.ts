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

import "dotenv/config";
import { Keypair } from "@mysten/sui/dist/cjs/cryptography";

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

export const refresh_token = async () => {

}

//development testing. Sending keypair bytes
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
        const secretKey = keypair.getSecretKey(); // Uint8Array
        const encodedKey = Buffer.from(secretKey).toString('base64');

        res.status(200).json({keypair: encodedKey})
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