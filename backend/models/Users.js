const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["buyer", "farmer", "logistics_admin"], required: true },
  location: { type: String, required: false},
  suiWalletAddress: { type: String }, // Store generated wallet address
  mnemonic: { type: String }, //Store encrypted mnemonic
  zkLoginAddress: { type: String },
  kycVerified: { type: Boolean, default: false }, // Future KYC verification
});

module.exports = mongoose.model("User", UserSchema);