//Code snippet for interactng with the blockchan from GPT
const express = require("express");

require("dotenv").config()
const app = express()
// const { Ed25519Keypair, JsonRpcProvider, RawSigner } = require("@mysten/sui");


// const SUI_RPC = "https://fullnode.devnet.sui.io";
// const provider = new JsonRpcProvider(SUI_RPC);


exports.CreateTransction = async (product, payment) => {
    //frontend passes payment as SUI coin
    let _product = {
        offchain_id: product._id.toString(),
        price: Number(product.price),
        farmer: product.farmer.suiWalletAddress, //farmer address stored in mongodb
    }

    const tx = {
        packageObjectId: process.env.PACKAGE_ID,
        module: process.env.MODULE_NAME,
        function: "create_order",
        arguments: [_product, payment],
        typeArguments: [],
        gasBudget: 10000,
    }

    const response = await signer.executeMoveCall(tx);

    console.log("transaction",response)

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




/** 🔹 COMPLETE ORDER (Release escrow funds to farmer) */
app.post("/orders/:id/complete", async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

        const tx = {
            packageObjectId: PACKAGE_ID,
            module: MODULE_NAME,
            function: "complete_order",
            arguments: [orderId],
            typeArguments: [],
            gasBudget: 5000,
        };

        const response = await signer.executeMoveCall(tx);
        console.log("Order Completed:", response);

        orders[orderId].status = "Completed";
        res.json({ message: "Order completed", order: orders[orderId] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** 🔹 CANCEL ORDER (Refund escrow to buyer) */
app.post("/orders/:id/cancel", async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

        const tx = {
            packageObjectId: PACKAGE_ID,
            module: MODULE_NAME,
            function: "cancel_order",
            arguments: [orderId],
            typeArguments: [],
            gasBudget: 5000,
        };

        const response = await signer.executeMoveCall(tx);
        console.log("Order Canceled:", response);

        orders[orderId].status = "Canceled";
        res.json({ message: "Order canceled", order: orders[orderId] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** 🔹 GET ORDER STATUS */
app.get("/orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orders[orderId]) return res.status(404).json({ error: "Order not found" });

        res.json({ order: orders[orderId] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});