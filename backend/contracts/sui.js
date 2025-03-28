const { Transaction } = require("@mysten/sui/transactions")
const { getFullnodeUrl, SuiClient } = require("@mysten/sui/client")

require("dotenv").config();

const client = new SuiClient({ url: getFullnodeUrl('devnet') });

exports.CreateTransction = async (product, payment, keypair) => {
    //frontend passes payment as SUI coin
    let _product = {
        offchain_id: product._id.toString(),
        price: Number(product.price),
        farmer: product.farmer.suiWalletAddress, //farmer address stored in mongodb
    }

    const tx = new Transaction();
    const target_smc = `${process.env.PACKAGE_ID}::${process.env.MODULE_NAME}::create_order`
    
    tx.moveCall({
        // package: process.env.PACKAGE_ID,
        // module: process.env.MODULE_NAME,
        // function: "create_order",
        target: target_smc,
        arguments: [tx.object(_product), tx.pure(payment)],
        typeArguments: [],
    })
    tx.setGasBudget(10000000)
    const response = await keypair.signAndExecuteTransactionBlock(tx);

    const orderEvent = response?.events?.find(
        (event) => event.moveEvent?.type === `${process.env.PACKAGE_ID}::${process.env.MODULE_NAME}::OrderCreated`
    );
    if (orderEvent) {
        const orderId = orderEvent.moveEvent.fields.order_id;
        console.log("New Order ID:", orderId);
    }else{
        console.log("no new event found")
    }
    return orderId
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