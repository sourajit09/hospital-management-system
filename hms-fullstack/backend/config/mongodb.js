import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hms";
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // fail fast instead of buffering forever
      socketTimeoutMS: 20000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error?.message || error);
    throw error; // bubble up so server won't start silently
  }
};

export default connectDB;
