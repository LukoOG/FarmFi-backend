// const crypto = require("crypto");
import crypto from "crypto";
import *  as bip39 from "bip39";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { derivePath } from "ed25519-hd-key";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; 

export const encryptMnemonic = (mnemonic: string, password: string) => {
    const key = crypto.scryptSync(password, "salt", 32); 
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(mnemonic, "utf-8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
}

export const decryptMnemonic = (encryptedMnemonic: string, password: string) => {
    try {const key = crypto.scryptSync(password, "salt", 32);
    const [ivHex, encrypted] = encryptedMnemonic.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf-8" );
    decrypted += decipher.final("utf-8");

    return decrypted;
} catch(err){
    console.log("error:",err)
    return"stuff"
}
}

export const getKeypair = async (mnemonic: string, password: string) => {
    //decrypt mnemonic and generte keypair
    const decryptedMnemonic = decryptMnemonic(mnemonic, password)
    const seed = bip39.mnemonicToSeedSync(decryptedMnemonic);
    const path = "m/44'/784'/0'/0'/0'"; // Standard for Sui wallets
    const derivedKey = derivePath(path, seed.toString("hex")).key;
    const keypair = Ed25519Keypair.fromSecretKey(derivedKey);
    return keypair
}