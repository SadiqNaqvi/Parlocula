import { oneDay } from "@lib/constants";
import { Session } from "@type/internal";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

export const storeSession = async (id: string, object: any) => {
  try {
    const resp = await redis.setex(id, oneDay * 30, {
      ...object,
      expiresOn: new Date().getTime() + oneDay * 30 * 1000,
    });
    return resp === "OK";
  } catch (err: any) {
    console.log("Error occured while storing sessions", err.message);
    return false;
  }
};

export const getSession = async (id: string): Promise<Session | null> => {
  try {
    return await redis.get(id);
  } catch (err) {
    console.log("Error getting sessions", err);
    return null;
  }
};

export const deleteSession = async (id: string) => {
  try {
    return !!(await redis.del(id));
  } catch (err) {
    console.error("Error occured while deleting session:", err);
    return false;
  }
};
