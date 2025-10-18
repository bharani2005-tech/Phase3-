import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import OTP from "../models/Otp.js";

// ❌ Removed the invalid and circular import line
// import { register, login, ..., getMe } from "../controllers/authController.js";

// backend/controllers/authController.js

// ===== Get Logged In User =====
export const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware.js
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAccountVerified: req.user.isAccountVerified,
    });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===== Send Reset OTP =====
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins

    await OTP.create({ email, otp, expiresAt, used: false });

    const html = `
      <p>Here is your password reset code:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail(email, "Password Reset Code", html);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendResetOtp error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ===== Register =====
export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    console.log("🧩 Register body:", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name: full_name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== Login =====
export const login = async (req, res) => {
  console.log("🧩 Login body:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== Placeholders =====
export const forgotPassword = (req, res) =>
  res.send("Forgot password not implemented yet");
export const resetPassword = (req, res) =>
  res.send("Reset password not implemented yet");
export const verifyOTP = (req, res) => res.send("Verify OTP not implemented yet");
export const resendOTP = (req, res) => res.send("Resend OTP not implemented yet");
