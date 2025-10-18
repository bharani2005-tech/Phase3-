// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS: allow your deployed frontend
app.use(
  cors({
    origin: "https://phase3-6jwn.vercel.app", // frontend URL
    credentials: true,
  })
);

// ✅ Connect to MongoDB
connectDB();

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running and connected to MongoDB Atlas!");
});

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// ✅ Optional test route for API connectivity
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
