import { Router } from "express";
import { createProduct, getAll, getByID, deleteProduct, updateProduct, createMultipleProducts, getByFarmer } from "../controllers/productControllers"
import upload from "../middlewares/upload";
const router = Router()

router.post("/create", 
    (req, res, next) => {
        req.body.folder = "product_images";
        next();
    },
    // upload.single("image"), 
    upload.array("image", 5), 
    createProduct
)

router.post("/create/multiple", 
    (req, res, next) => {
        req.body.folder = "product_images";
        next();
}, 
upload.array("images", 10), 
createMultipleProducts
)

router.get("/all", getAll)
router.get("/:id", getByID)
router.get("/farmer/:id", getByFarmer)
router.put("/update/:id", updateProduct)

router.delete("/delete/:id", deleteProduct)

export default router