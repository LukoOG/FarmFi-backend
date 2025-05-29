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

interface Location  {
  home: string,
  state: string, 
}

export interface IUser extends Document{
    name: string;
    email: string;
    phone: string;
    password: string | null;
    role: string;
    NIN: string;
    location: Location;
    suiWalletAddress: string;
    mnemonic?: string;
    imgUrl?: string;
    zkLogin: IZkLoginInfo | null,
    kycVerified: boolean;
    farms: mongoose.Types.ObjectId[];
}

export type SafeUser = Omit<IUser, "password" | "mnemonic">;

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "farmer", "logistics_admin"], required: true },
    NIN: { type: String,  required: true },
    location: { type: {
      home: String,
      state: String,
    }, required: true, _id: false},
    suiWalletAddress: { type: String }, // Store generated wallet address zkogin or traditional
    mnemonic: { type: String }, //Store encrypted mnemonic
    imgUrl: { type: String },
    zkLogin: {type:
      {
        sub: String,
        salt: String,
      }
    },
    kycVerified: { type: Boolean, default: false }, // Future KYC verification
    farms: { type: [Schema.Types.ObjectId], ref: "Farm", default: null }
})

UserSchema.set("toJSON", {
    transform: function (doc, ret, options){
        delete ret.password
        delete ret.mnemonic
        return ret
    }
})

UserSchema.pre("save", function (next) {
  if (this.role !== "farmer" && this.farms && Array.isArray(this.farms) && this.farms.length > 0) {
    return next(new Error("Only farmers can have a farm"));
  }
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema)