import mongoose, {Document, Schema} from "mongoose";

const categories =[
    "Staple",
    "Cash",
    "Others",
] as const;

export interface IProduct extends Document{
    _id: mongoose.Types.ObjectId;
    name: string;
    farmer: mongoose.Types.ObjectId;
    price: number;
    description?: string;
    location?: string;
    category: typeof categories[number];
    weight: number;
    imgUrl?: string;
    available: boolean;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //reference to the farmer
    price: { type: Number, required: true, default:0 },
    description: { type: String },
    location: { type: String },
    category: { type: String, enum: categories, required:true },
    weight: { type: Number, required:true },
    imgUrl: { type: String },
    available: { type: Boolean, required:true, default:true},
})

export const Product = mongoose.model<IProduct>("Product", ProductSchema)