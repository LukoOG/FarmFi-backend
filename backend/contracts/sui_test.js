//testing the sui sdk
const { getFullnodeUrl, SuiClient } = require("@mysten/sui/client");
const { Transaction } = require("@mysten/sui/transactions");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const fs = require("fs")

// use getFullnodeUrl to define the Devnet RPC location
const rpcUrl = getFullnodeUrl('devnet');

// create a client connected to devnet
const client = new SuiClient({ url: rpcUrl });
const sui_conversion = 1e9


//test wallet address

// async function generatekeypair(){
//     let keypair = new Ed25519Keypair()
//     let public_key = keypair.getPublicKey().toSuiAddress()
//     let private_key = keypair.getSecretKey().toString()
//     let new_data = `wallet address: ${public_key}, private_key: ${private_key}`
//     fs.writeFile("test_keypairs.txt", new_data, (err)=>{
//         if (err) throw errs
//     })

// }

const private_key = "suiprivkey1qqmr80d558vgnrafw8he9w0yhtdrn0sh06xfrcg2mvn7l2m34shfz6g46f4"
// const my_wallet= "0x88af0b7da4e2f601e365168b6c8d0b726a20718a4fc9bf16c2e393cb4d05724f"
const my_wallet = "0xf4418e0f91ab25edae1407fd255b66fc514b1ed1f58dca18f87b0f1a42cbbd79"
async function deriveKeypair(private){
    return await Ed25519Keypair.fromSecretKey(private)
}

async function getOwnedCoins() {
    const coins = await client.getCoins({
        owner: my_wallet,
    });
    // console.log(coins.data.find(coin=>coin.balance == 4*sui_conversion));
    // console.log(coins.data.pop());/
    console.log(coins)
}

async function getOwnedObjects() {
    const objects = await client.getOwnedObjects({
        owner: my_wallet
    })
    console.log(objects.data)
}

async function getAllCoins() {
    const coins = await client.getAllCoins({
        owner: my_wallet
    })
    for (const coin of coins.data) {
        console.log(`Coin Type: ${coin.coinType}`);
        console.log(`Coin Object ID: ${coin.coinObjectId}`);
        console.log(`Balance: ${coin.balance/1e9}`);
        console.log('--------------------');
    }
}

async function createGas(){
    let tx = new Transaction()
    const keypair = await deriveKeypair(private_key)
    const coins = await client.getAllCoins({
        owner: my_wallet
    })

    const [gasCoin] = tx.splitCoins(tx.object(coins.data.coinObjectId), [1000000000])
}

//todo, create a function that goes through the wallet with 2 coins of value 10 and gets a coin of value 13
async function extractPayment (prc){
    const price = prc * 1e9
    let tx = new Transaction()
    const keypair = await deriveKeypair(private_key)
    
    const coins = await client.getAllCoins({
        owner: my_wallet
    })
    let ownedCoints = coins.data

    if (ownedCoints.length === 0 || (ownedCoints.length == 1 && ownedCoints[0].balance < price)){
        console.log("not enough balance")
        return
    }
    let destination_coin = ownedCoints[0] //splitting the payment from their first coin object
    for(let i = 1; i <= ownedCoints.length; i++){
        if (destination_coin.balance<price){
            console.log('herer')
            tx.mergeCoins(tx.object(destination_coin.coinObjectId), [ownedCoints[i]])
        }else if(destination_coin.balance>price){
            console.log('here1')
            const [paymentCoin] = tx.splitCoins(tx.object(destination_coin.coinObjectId), [price])
            tx.transferObjects([paymentCoin], my_wallet);
            break;
        }
    }
    
    tx.setGasBudget(100000000)
    const result = await client.signAndExecuteTransaction({signer: keypair, transaction: tx});
    await client.waitForTransaction({digest: result.digest});
    console.log("Transaction successful. Digest:", result.digest);
    console.log("result:",result)
    }

    


// getOwnedCoins();
getOwnedObjects();
// getAllCoins();
// extractPayment(4);



//dont run again
// generatekeypair()