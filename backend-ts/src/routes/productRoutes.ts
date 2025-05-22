import { Router } from "express";
import { createProduct, getAll, getByID, deleteProduct, updateProduct, createMultipleProducts } from "../controllers/productControllers"
import upload from "../middlewares/upload";
const router = Router()

router.post("/create", upload.single("image"), createProduct)
router.post("/create/multiple", upload.array("images", 10), createMultipleProducts)
router.get("/all", getAll)
router.get("/:id", getByID)
router.put("/update/:id", updateProduct)

router.delete("/delete/:id", deleteProduct)

export default router