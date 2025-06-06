import { IProduct } from "../models/Product";

import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { CoinStruct } from "@mysten/sui/dist/cjs/client";
import { sui_conversion, client } from "./sui-constants";



const coinType = ""
export const createOrderTx = async (payment:CoinStruct) => {

    const tx = new Transaction();
    const target_smc = `${process.env.MOVE_PACKAGE_ID}::${process.env.MOVE_MODULE_NAME}::create_order`

    const FarmerPaymentDetails = tx.makeMoveVec({elements: })
    tx.moveCall({
        target: target_smc,
        arguments: [
            tx.pure.string(offchain_id),
            tx.object.option({
                type:'option<Coin<T>>', 
                value: payment.coinObjectId
            }),
        ],
        typeArguments: [],
    })
    tx.setGasBudget(10000000)

    const transactionBytes = await tx.build({ client })

    return transactionBytes
}