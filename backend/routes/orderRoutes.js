const express = require('express');
const router = express.Router();

const orderController = require("../controllers/orderControllers")

// Sample order endpoint
router.post('/place', async (req, res) => {
    const { buyerAddress, farmerAddress, productId, price } = req.body;

    if (!buyerAddress || !farmerAddress || !productId || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Here you'd interact with the Sui smart contract
        res.status(200).json({ success: true, message: 'Order placed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

router.post("/order", orderController.create_order)

module.exports = router;
