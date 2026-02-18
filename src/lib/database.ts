import mongoose from "mongoose";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

declare global {
  var mongooseGlobal: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

global.mongooseGlobal ??= {
  conn: null,
  promise: null,
};

export async function connectDatabase(): Promise<boolean> {
  if (global.mongooseGlobal.conn) return true;

  if (!process.env.MONGODB_URI) {
    console.error("MongoDb Uri is not available");
    return false;
  }

  try {
    if (!global.mongooseGlobal.promise) {
      global.mongooseGlobal.promise = mongoose.connect(process.env.MONGODB_URI);
    }

    global.mongooseGlobal.conn = await global.mongooseGlobal.promise;
    console.log("MongoDB Connected Successfully.");
    return true;
  } catch (err: any) {
    console.log("MongoDB connection failed: ", err.message);
    return false;
  }
}
