const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  profile,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");
const verifyToken = require("../midleware/authmiddleware");

// 👇 new route
router.get("/profile", verifyToken, profile);
router.post("/send-otp", sendOtp);
// router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
module.exports = router;
