import mongoose, {Document, Schema} from "mongoose";

const status = [
    "Pending",
    "Completed",
    "Cancelled",
] as const;

export interface FarmerPaymentDetail{
    farmer: string; 
    suiWalletAddress: string;
    paymentAmount: number;
    quantityMap: Record<string, number>;

    // logic to allow smart contract pay farmers whose goods have arrived
    // deliverStatus: string; 
    // 
} 
//how much each farmer in the order is to be paid by the smart contract

interface IOrder extends Document{
    farmerPayments: FarmerPaymentDetail[];
    buyer: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
    totalPrice: number;
    status: typeof status[number];
    escrowTxHash?: string;
}

const FarmerPaymentSchema = new Schema<FarmerPaymentDetail>({
  farmer: { type: String, required: true },
  suiWalletAddress: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  quantityMap: {
    type: Map,
    of: Number,
    required: true,
  },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    farmerPayments: { type:[FarmerPaymentSchema], _id:false },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    totalPrice: { type: Number, required: true },
    status: {type: String, enum:status, required: true, default: "Pending"},
    escrowTxHash: { type: String } //Order transaction hash on-chain
}, { timestamps: true })

OrderSchema.pre("save", function (next){
    let totalPaymentDetailPrice = 0;
    for (let i=0; i <=this.farmerPayments.length-1;i++){
        totalPaymentDetailPrice += this.farmerPayments[i].paymentAmount
        console.log(`${this.totalPrice}, payment details: ${this.farmerPayments[i].paymentAmount}`)
    }

    if(this.totalPrice != totalPaymentDetailPrice){
        console.log(`total price: ${this.totalPrice}, total price from payment details: ${totalPaymentDetailPrice}`)
        // return next(new Error("totalprice field and sum of payment amount in Farmer details must match"))
        return next(new Error(`totalprice field and sum of payment amount in Farmer details must match total price: ${this.totalPrice}, total price from payment details: ${totalPaymentDetailPrice}`))
    }
    next()
})

const Order = mongoose.model<IOrder>("Order", OrderSchema)
export default Order
