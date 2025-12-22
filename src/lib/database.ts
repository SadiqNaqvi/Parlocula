import mongoose from "mongoose";

export async function connectDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;

  else if (!process.env.MONGODB_URI) {
    console.error("MongoDb Uri is not available");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully.");
    return true;
  } catch (err: any) {
    console.log("MongoDB connection failed: ", err.message);
    return false;
  }
}
