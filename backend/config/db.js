import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true, // ✅ ensures TLS connection
      tlsAllowInvalidCertificates: true, // ✅ allows local/self-signed certificates
      tlsAllowInvalidHostnames: true, // ✅ avoids hostname mismatch errors
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
