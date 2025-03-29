const Order = require("../models/Orders");
const User = require("../models/Users");
const Product = require("../models/Products");
const Contracts = require("../contracts/sui");
const bcrypt = require("bcryptjs");
const bip39 = require("bip39")
const { derivePath } = require("ed25519-hd-key")
const { extractPayment } = require("../utils/sui-utils");
const { decryptMnemonic } = require("../utils/mnemonic");

const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
;

exports.get_order = async (req, res) => {
    //adjust according to frontend needs
    const { farmer } = req.body
    const order = await Order.find({farmer}).find

    if(!order){
        return res.status(400).json({msg: "Order not found"})
    }
}

exports.create_order = async (req, res) => {
    const { buyer, product, payment, password } = req.body //expected information
    //cases to abort operation
    let user = await User.findOne({ email:buyer });
    if(!User.findById(product.farmer) || !user) res.status(400).json({error: "invalid users"})
    //construct the keypair
    const isMatch = bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg:"Invalid password" })

    //decrypt mnemonic and generte keypair
    const decryptedMnemonic = decryptMnemonic(user.mnemonic, password)
    const seed = bip39.mnemonicToSeedSync(decryptedMnemonic);
    const path = "m/44'/784'/0'/0'/0'"; // Standard for Sui wallets
    const derivedKey = derivePath(path, seed.toString("hex")).key;
    const keypair = Ed25519Keypair.fromSecretKey(derivedKey);

    //creating onchain transaction and retrieving escrow hash
    const _payment = await extractPayment(payment, keypair)
    const tx = await Contracts.CreateTransction(product, _payment, keypair)

    let tes_f = await User.findOne({email:"emmanueladesipe01@gmail.com"})
    let tes_p = await Product.findById({_id:"67e5663c99e5416963bc984e"})
    let order = new Order({
        farmer:tes_f,
        buyer,
        product:[tes_p],
        totalPrice:payment,
        escrowTxHash: tx,
    })
    res.status(200).json({msg:"order created", txHash:tx}) //sending to frontend to sign
}

exports.cancel_order = async (req, res) => {
    return
}

// exports.list_all = async (req, res) => {
//     const { buyer, farmer } = req.body
//     if()
// }