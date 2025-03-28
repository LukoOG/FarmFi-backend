const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bip39 = require("bip39")
const { derivePath } = require("ed25519-hd-key")

const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519"); // Sui wallet generation

//imports for zklogin logic
const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const {
    genAddressSeed,
    generateNonce,
    generateRandomness,
    getExtendedEphemeralPublicKey,
    getZkLoginSignature,
    jwtToAddress,
} = require("@mysten/sui/zklogin")
const { decodePrivateKey } = require("@mysten/sui/cryptography")
const { jwtDecode } = require("jwt-decode");
const { encryptMnemonic,  decryptMnemonic } = require("../utils/mnemonic");

exports.register = async(req, res)=> {
    try{
        const { name, email, password, role} = req.body

        //check if user doesn't already exist
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });
    

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating the recovery phrase
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

        //generate jwt-token
        const payload = { user: user };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "7d" });
    
        res.json({ token, mnemonic, suiWalletAddress });
    } catch(error){
        console.log(error)
        res.status(500).send("Server error");
    }
}

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body
        
        //get the user
        let user = await User.findOne({email})
        if (!user) return res.status(400).json({ msg: "User does not exist" });

        //check password
        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ msg:"Invalid credentials" })

        //generate token
        const payload = { user: user };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,  // Set to true in production (requires HTTPS)
            sameSite: "None",
            maxAge: 3600000, // 1 hour
        });


        res.json({token, suiWalletAddress: user.suiWalletAddress})

    }catch(error){
        console.log(error)
        res.status(500).send("Server error");
    }
}

exports.getkeypair = async (req, res) => {
    let { email, password } = req.body;
    //check if user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    //check if password is valid
    const isMatch = bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg:"Invalid password" })

    //decrypt mnemonic and generte keypair
    const decryptedMnemonic = decryptMnemonic(user.mnemonic, password)
    const seed = bip39.mnemonicToSeedSync(decryptedMnemonic);
    const path = "m/44'/784'/0'/0'/0'"; // Standard for Sui wallets
    const derivedKey = derivePath(path, seed.toString("hex")).key;
    const keypair = Ed25519Keypair.fromSecretKey(derivedKey);
    return res.json({keypair})
}

//zklogin pathway
exports.login_oauth = async (req, res) => {
    try{

    } catch(error){
        console.log(error);
        res.status(500).send("oauth failed")
    }
}