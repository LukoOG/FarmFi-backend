import mongoose, {Document, Schema} from "mongoose";

const status = [
    "Pending",
    "Completed",
    "Cancelled",
] as const;

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    role: string;
    location: string;
    suiWalletAddress: string;
    mnemonic?: string;
    zkLoginAddress?: string;
    kycVerified: boolean;
}
export type SafeUser = Omit<IUser, "password" | "mnemonic">;

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "farmer", "logistics_admin"], required: true },
    location: { type: String, required: false},
    suiWalletAddress: { type: String }, // Store generated wallet address
    mnemonic: { type: String }, //Store encrypted mnemonic
    zkLoginAddress: { type: String },
    kycVerified: { type: Boolean, default: false }, // Future KYC verification
})

UserSchema.set("toJSON", {
    transform: function (doc, ret, options){
        delete ret.password
        delete ret.mnemonic
        return ret
    }
})

export const User = mongoose.model<IUser>("User", UserSchema)

