import mongoose, {Document, Schema} from "mongoose";

export interface IFarm extends Document {
  type: string;
  name?: string;
  location: string;
  size?: number; // in acres
  crops?: string[]; // e.g., ["maize", "cassava"]
  farmer: mongoose.Types.ObjectId; // Reference to the farmer user
}

const FarmSchema = new Schema<IFarm>({
    type: { type: String, required: true },
    name: { type: String},
    location: { type: String, required: true },
    size: { type: Number },
    crops: [{ type: String }],
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
})

export const Farm = mongoose.model<IFarm>("Farm", FarmSchema);