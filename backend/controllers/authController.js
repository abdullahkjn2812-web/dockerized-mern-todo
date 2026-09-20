const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");
const Otp = require("../models/otp");

const nodemiler = require("nodemailer");
const { randomInt } = require("crypto");

// GMail ka sath connect karne ke liye
const transporter = nodemiler.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ token, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "user not found ",
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: "Server Error ",
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = randomInt(100000, 1000000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save the OTP to the database
    await Otp.deleteOne({ email }); // Delete any existing OTP for the email

    const newOtp = new Otp({
      name,
      email,
      password: hashedPassword,
      otp: hashedOtp,
    });
    await newOtp.save();

    // Send the OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Valid email and 6-digit OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP OR EXPIRED OTP " });
    }
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
      } else {
        await otpRecord.save();
      }
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const newUser = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
    });

    await newUser.save();

    await Otp.deleteOne({ _id: otpRecord._id }); // Delete the used OTP

    res.status(201).json({ message: "OTP verified successfully" });
  } catch (error) {
    // await Otp.deleteOne({ _id: otpRecord._id }); // Delete the used OTP
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  signup,
  login,
  profile,
  sendOtp,
  verifyOtp,
};
