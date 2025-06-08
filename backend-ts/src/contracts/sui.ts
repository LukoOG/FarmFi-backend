import { Transaction } from "@mysten/sui/transactions";
import { CoinStruct } from "@mysten/sui/dist/cjs/client";
import { client } from "./sui-constants";
import { FarmerPaymentDetail } from "../models/Order";
import { bcs } from "@mysten/sui/bcs";

const FarmerPaymentDetailLayout = bcs.struct('FarmerPaymentDetail', {
  farmer: bcs.Address,
  paymentAmount: bcs.U64,
});

const constructPaymentBytes = (paymentDetails:FarmerPaymentDetail[]) => {
    const typeMAP: Record<string, {farmer: string, paymentAmount:number}> = {}
    for(const detail of paymentDetails){
        if(!typeMAP[detail.farmer]){
            typeMAP[detail.farmer] = {
                farmer: detail.suiWalletAddress,
                paymentAmount: detail.paymentAmount
            }
        }
    }
    let paymentDetailsList = Object.values(typeMAP)
    const paymentDetailsBytes = paymentDetailsList.map(detail => {
        return FarmerPaymentDetailLayout.serialize({
            farmer: detail.farmer,
            paymentAmount: BigInt(detail.paymentAmount)
        }).toBytes()
    })
    // const paymentDetailsVector = paymentDetailsBytes.map((bytes)=>tx.pure(bytes))
    return paymentDetailsBytes
}

const constructFarmerandPaymentVectors = (paymentDetails:FarmerPaymentDetail[]) => {
    let farmers = paymentDetails.map(detail=>detail.suiWalletAddress)
    let payments = paymentDetails.map(detail=>BigInt(detail.paymentAmount))
    return { farmers, payments}
}

// const coinType = ""
const CreateSMC = `${process.env.MOVE_PACKAGE_ID}::${process.env.MOVE_MODULE_NAME}::create_order`
const paymentVectorType = `${process.env.MOVE_PACKAGE_ID}::config::FarmerPaymentDetail`

export const createOrderTx = async (sender:string, offchain_id: string, payment:CoinStruct, paymentDetails:FarmerPaymentDetail[], totalPrice: number) => {

    const tx = new Transaction();
    const paymentDetailsBytes = constructPaymentBytes(paymentDetails)
    const paymentDetailsArguments = paymentDetailsBytes.map((bytes)=>tx.pure(bytes))
    // const paymentDetailsVector = tx.makeMoveVec({ type: paymentVectorType, elements:paymentDetailsArguments})

    console.log(offchain_id, typeof offchain_id)

    const {farmers, payments} = constructFarmerandPaymentVectors(paymentDetails)


    tx.moveCall({
        target: CreateSMC,
        arguments: [
            tx.pure.string(offchain_id as string),
            // paymentDetailsVector,
            tx.pure.vector('address', farmers),
            tx.pure.vector('u64', payments),
            tx.object(payment.coinObjectId),
            tx.pure.u64(totalPrice)
        ],
        typeArguments: [],
    })
    tx.setGasBudget(10000000)
    tx.setSender(sender)

    const transactionBytes = await tx.build({ client })

    return transactionBytes
}