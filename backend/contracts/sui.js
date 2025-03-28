//Code snippet for interactng with the blockchan from GPT
const express = require("express");
const { Ed25519Keypair, JsonRpcProvider, RawSigner } = require("@mysten/sui");


const SUI_RPC = "https://fullnode.devnet.sui.io"; // Change for mainnet
const provider = new JsonRpcProvider(SUI_RPC);

// Wallet private key for signing transactions (DO NOT expose in frontend)
const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(, "hex")));
const signer = new RawSigner(keypair, provider);

// Deployed Move contract details
const PACKAGE_ID = "0xYourPackageId";
const MODULE_NAME = "order";
const TREASURY_CAP = "0xYourTreasuryCapObjectId"; // Required for minting escrow funds

// Simulated MongoDB Order model (Replace with actual DB schema)
const orders = {}; // Replace with MongoDB collection

/** 🔹 CREATE ORDER (Buyer places order & funds go to escrow) */

exports.CreateTransction = async (farmer, buyer, price) => {
    const tx = {
        packageObjectId: PACKAGE_ID,
        module: MODULE_NAME,
        function: "create_order",
        arguments: [farmer, price, TREASURY_CAP],
        typeArguments: [],
        gasBudget: 10000,
    }
    const response = await signer.executeMoveCall(tx);
    console.log("Order Created:", response);
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