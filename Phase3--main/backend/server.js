import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ import your routes

dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://bharani2005-tech.github.io"
    ],
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// Basic test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running and connected to MongoDB Atlas!");
});

// ✅ Register Auth routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
