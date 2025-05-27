import { IProduct } from "../models/Product";

import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { getSplitCoin } from "./sui-utils";
import { CoinStruct } from "@mysten/sui/dist/cjs/client";
import { sui_conversion, client } from "./sui-constants";

interface IProductWithFarmerAddress extends IProduct {
    suiWalletAddress: string;
  }

//todo, create a function that goes through the wallet with 2 coins of value 10 and gets a coin of value 13
//won't work for just 1 coin
//Delibate on whether it should be on the frontend
export const extractPayment = async (prc: number, keypair:Ed25519Keypair) => {
    const price: number = prc * sui_conversion
    const wallet = keypair.getPublicKey().toSuiAddress()
    let tx = new Transaction()
    
    const coins = await client.getAllCoins({
        owner: wallet
    })
    let ownedCoins = coins.data

    if (ownedCoins.length === 0 || (ownedCoins.length == 1 && Number(ownedCoins[0].balance) < price)){
        console.log("not enough balance")
        return
    }
    let destination_coin = ownedCoins[0] //splitting the payment from their first coin object
    for(let i = 1; i <= ownedCoins.length; i++){
        if (Number(destination_coin.balance) < price){
            tx.mergeCoins(tx.object(destination_coin.coinObjectId), [tx.object(ownedCoins[i].coinObjectId)])
        }else if(Number(destination_coin.balance) >= price){
            const [paymentCoin] = tx.splitCoins(tx.object(destination_coin.coinObjectId), [price])
            tx.transferObjects([paymentCoin], wallet);
            break;
        }
    }

    tx.setGasBudget(100000000)
    const { digest } = await client.signAndExecuteTransaction({signer: keypair, transaction: tx});
    await client.waitForTransaction({digest: digest});
    let coin = await getSplitCoin(wallet, price)
    return coin
}


export const createOrderTx = async (product:IProductWithFarmerAddress, offchain_id: string, payment:CoinStruct, keypair: Ed25519Keypair) => {
    let _product = {
        offchain_id: product._id.toString(),
        price: Number(product.price), 
        farmer: product.suiWalletAddress, //farmer address stored in mongodb
    }
        
    const tx = new Transaction();
    const target_smc = `${process.env.MOVE_PACKAGE_ID}::${process.env.MOVE_MODULE_NAME}::create_order`
    tx.moveCall({
        target: target_smc,
        arguments: [
            tx.pure.string(offchain_id),
            tx.pure.address(_product.farmer),
            tx.object(payment.coinObjectId),
        ],
        typeArguments: [],
    })
    tx.setGasBudget(10000000)
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options:{
            showEffects: true,
            showObjectChanges: true,
        }
    })
    await client.waitForTransaction({digest: result.digest});

    return result
}