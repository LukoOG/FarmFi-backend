import { Router } from "express";
import { createProduct, getAll, getByID, deleteProduct, updateProduct } from "../controllers/productControllers"
import upload from "../middlewares/upload";
const router = Router()

router.post("/create", upload.single("image"), createProduct)
router.get("/all", getAll)
router.get("/:id", getByID)
router.put("/update", updateProduct)
router.delete("/delete", deleteProduct)

export default router