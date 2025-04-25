import mongoose from "mongoose";

export async function connectPPDB(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;

  if (!process.env.PP_MONGODB_URI) {
    console.error("MongoDb Uri is not available");
    return false;
  }

  try {
    await mongoose.connect(process.env.PP_MONGODB_URI);
    console.log("MongoDB Connected Successfully.");
    return true;
  } catch (err: any) {
    console.log("MongoDB connection failed: ", err.message);
    return false;
  }
}
