const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519"); // Sui wallet generation

exports.register = async(req, res)=> {
    try{
        const { name, email, password, role} = req.body

        //check if user doesn't already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //generating their wallet
        const keypair = new Ed25519Keypair();
        const suiWalletAddress = keypair.toSuiAddress();

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            suiWalletAddress
        })
        await user.save()

        //generate jwt-token
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "7d" });
    
        res.json({ token, suiWalletAddress });
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
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,  // Set to true in production (requires HTTPS)
            sameSite: "Strict",
            maxAge: 3600000, // 1 hour
        });


        res.json({token, suiWalletAddress: user.suiWalletAddress})

    }catch(error){
        console.log(error)
        res.status(500).send("Server error");
    }
}

//zklogin pathway
