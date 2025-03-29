//utility functions for interacting with sui related stuff
const { getFullnodeUrl, SuiClient } = require("@mysten/sui/client");
const { Transaction } = require("@mysten/sui/transactions");

// use getFullnodeUrl to define the Devnet RPC location
const rpcUrl = getFullnodeUrl('devnet');

// create a client connected to devnet
const client = new SuiClient({ url: rpcUrl });

exports.extractPayment = async function (prc, keypair){
    const price = prc * 1e9
    let tx = new Transaction()
    const wallet = keypair.getPublicKey().toSuiAddress()
    const coins = await client.getAllCoins({
        owner: wallet
    })
    let ownedCoints = coins.data

    if (ownedCoints.length === 0 || (ownedCoints.length == 1 && ownedCoints[0].balance < price)){
        console.log("not enough balance")
        return
    }
    let destination_coin = ownedCoints[0] //splitting the payment from their first coin object
    for(let i = 1; i <= ownedCoints.length; i++){
        if (destination_coin.balance<price){
            // console.log('herer')
            tx.mergeCoins(tx.object(destination_coin.coinObjectId), [ownedCoints[i]])
        }else if(destination_coin.balance>price){
            const [paymentCoin] = tx.splitCoins(tx.object(destination_coin.coinObjectId), [price])
            tx.transferObjects([paymentCoin], wallet);
            break;
        }
    }
    
    tx.setGasBudget(100000000)
    const result = await client.signAndExecuteTransaction({signer: keypair, transaction: tx});
    await client.waitForTransaction({digest: result.digest});
    let coin = await getOwnedCoins(wallet)
    return coin
    }


async function getOwnedCoins(wallet) {
    const coins = await client.getCoins({
        owner: wallet,
    });
    // console.log(coins.data.find(coin=>coin.balance == 4*sui_conversion));
    return coins.data.pop();
}