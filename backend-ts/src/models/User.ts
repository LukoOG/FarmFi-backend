import mongoose, {Document, Schema} from "mongoose";

const status = [
    "Pending",
    "Completed",
    "Cancelled",
] as const;

export interface IZkLoginInfo {
  sub: string;
  salt: string;
}

export interface IUser extends Document{
    name: string;
    email: string | null;
    password: string | null;
    role: string;
    location: string;
    suiWalletAddress: string;
    mnemonic?: string;
    zkLogin: IZkLoginInfo | null,
    kycVerified: boolean;
    farm?: mongoose.Types.ObjectId;
}

export type SafeUser = Omit<IUser, "password" | "mnemonic">;

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "farmer", "logistics_admin"], required: true },
    location: { type: String, required: false},
    suiWalletAddress: { type: String }, // Store generated wallet address zkogin or traditional
    mnemonic: { type: String }, //Store encrypted mnemonic
    zkLogin: {type:
      {
        sub: String,
        salt: String,
      }
    },
    kycVerified: { type: Boolean, default: false }, // Future KYC verification
    farm: { type: Schema.Types.ObjectId, ref: "Farm" }
})

UserSchema.set("toJSON", {
    transform: function (doc, ret, options){
        delete ret.password
        delete ret.mnemonic
        return ret
    }
})

UserSchema.pre("save", function (next) {
  if (this.role !== "farmer" && this.farm) {
    return next(new Error("Only farmers can have a farm"));
  }
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema)