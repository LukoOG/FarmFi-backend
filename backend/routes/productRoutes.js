const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload")

const productController = require("../controllers/productControllers")

router.post("/create", upload.single("image"), productController.create_product)
router.get("/", productController.get_All);
router.get("/:id", productController.get_id);
router.put("/update/:id", productController.update_product)
router.delete("/delete/:id", productController.delete_product)

module.exports = router