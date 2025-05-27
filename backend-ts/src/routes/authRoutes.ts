import { Router } from "express";
import { getkeypair, login, register, updateProfile } from "../controllers/authControllers";
import upload from "../middlewares/upload";

export const router = Router()

router.post("/login", login)
router.post(
    "/update/:id",
    (req, res, next) => {
        req.body.folder = "user_images";
        next();
    },
    upload.single("image"),
    updateProfile
)
router.post("/register", register)
router.post("/keypair", getkeypair)

export default router