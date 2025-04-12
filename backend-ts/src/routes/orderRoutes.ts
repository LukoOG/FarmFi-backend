import { Router } from "express";
import { getOrder, createOrder } from "../controllers/orderControllers";

const router = Router()

router.get("/:id", getOrder)
router.post("/create", createOrder)
// router.post()

export default router