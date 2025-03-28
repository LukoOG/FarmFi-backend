const { Router } = require("express")
const { login, register, getkeypair } = require("../controllers/authControllers.js")

const router = Router()

router.post("/login", login)
router.post("/register", register)
router.post("/get_keypair", getkeypair)

module.exports = router