import { Router } from "express";
import { getkeypair, login, register } from "../controllers/authControllers";

export const router = Router()

router.post("/login", login)
router.post("/register", register)
router.post("/keypair", getkeypair)

export default router