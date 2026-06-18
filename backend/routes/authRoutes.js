const express = require("express");
const router = express.Router();

const { signup, login, profile } = require("../controllers/authController");
const verifyToken = require("../midleware/authmiddleware");

// 👇 new route
router.get("/profile", verifyToken, profile);

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
