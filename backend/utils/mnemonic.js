const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; 

exports.encryptMnemonic = (mnemonic, password) => {
    const key = crypto.scryptSync(password, "salt", 32); 
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(mnemonic, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
}

exports.decryptMnemonic = (encryptedMnemonic, password) => {
    const key = crypto.scryptSync(password, "salt", 32);
    const [ivHex, encrypted] = encryptedMnemonic.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}