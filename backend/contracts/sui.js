const { Transaction } = require("@mysten/sui/transactions")
const { getFullnodeUrl, SuiClient } = require("@mysten/sui/client")
require("dotenv").config();

const client = new SuiClient({ url: getFullnodeUrl('devnet') });

exports.CreateTransction = async (product, payment, keypair) => {
    //frontend passes payment as SUI coin
    // let _product = {
    //     offchain_id: product._id.toString(),
    //     price: Number(product.price),
    //     farmer: product.farmer.suiWalletAddress, //farmer address stored in mongodb
    // }
    //test product
    let wallet_add = keypair.getPublicKey().toSuiAddress()
    let farmer_address = wallet_add.trim().toLowerCase()
    let _product = {
        offchain_id: '67e5663c99e5416963bc984e',
        price: Number(1),
        farmer: wallet_add,
    }
    
    const tx = new Transaction();
    const target_smc = `${process.env.MOVE_PACKAGE_ID}::${process.env.MOVE_MODULE_NAME}::create_order`
    tx.moveCall({
        target: target_smc,
        arguments: [
            tx.pure.string(_product.offchain_id), 
            tx.pure.u64(1), 
            tx.pure.address(farmer_address),
            tx.object(payment),
        ],
        typeArguments: [],
    })
    tx.setGasBudget(10000000)
    const response = await client.signAndExecuteTransaction({signer: keypair, transaction:tx});
    console.log(response)

    // let orderId;

    // const orderEvent = response?.events?.find(
    //     (event) => event.moveEvent?.type === `${process.env.MOVE_PACKAGE_ID}::${process.env.MOVE_MODULE_NAME}::OrderCreated`
    // );
    // if (orderEvent) {
    //     orderId = orderEvent.moveEvent.fields.order_id;
    //     console.log("New Order ID:", orderId);
    // }else{
    //     console.log("no new event found")
    // }
    return response.digest
}




// /** 🔹 COMPLETE ORDER (Release escrow funds to farmer) */
// app.post("/orders/:id/complete", async (req, res) => {
//     try {
//         const orderId = req.params.id;
//         if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

//         const tx = {
//             packageObjectId: PACKAGE_ID,
//             module: MODULE_NAME,
//             function: "complete_order",
//             arguments: [orderId],
//             typeArguments: [],
//             gasBudget: 5000,
//         };

//         const response = await signer.executeMoveCall(tx);
//         console.log("Order Completed:", response);

//         orders[orderId].status = "Completed";
//         res.json({ message: "Order completed", order: orders[orderId] });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /** 🔹 CANCEL ORDER (Refund escrow to buyer) */
// app.post("/orders/:id/cancel", async (req, res) => {
//     try {
//         const orderId = req.params.id;
//         if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

//         const tx = {
//             packageObjectId: PACKAGE_ID,
//             module: MODULE_NAME,
//             function: "cancel_order",
//             arguments: [orderId],
//             typeArguments: [],
//             gasBudget: 5000,
//         };

//         const response = await signer.executeMoveCall(tx);
//         console.log("Order Canceled:", response);

//         orders[orderId].status = "Canceled";
//         res.json({ message: "Order canceled", order: orders[orderId] });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// /** 🔹 GET ORDER STATUS */
// app.get("/orders/:id", async (req, res) => {
//     try {
//         const orderId = req.params.id;
//         if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

//         res.json({ order: orders[orderId] });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });