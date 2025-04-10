import mongoose, {Document, Schema} from "mongoose";

const status = [
    "Pending",
    "Completed",
    "Cancelled",
] as const;

interface IOrder extends Document{
    farmer: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId[];
    totalPrice: number;
    status: typeof status[number];
    escrowTxHash?: string;

}

const OrderSchema = new Schema<IOrder>({
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    totalPrice: { type: Number, required: true },
    status: {type: String, enum:status, required: true, default: "Pending"},
    escrowTxHash: { type: String } //Order transaction hash on-chain
}, { timestamps: true })

const Order = mongoose.model<IOrder>("Order", OrderSchema)
export default Order
