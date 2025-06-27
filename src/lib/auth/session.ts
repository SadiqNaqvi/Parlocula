import { oneDay } from "@lib/constants";
import { Session } from "@type/internal";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

export const storeToRedis = async (
  id: string,
  exp: number,
  obj: Record<string, any>
) => {
  try {
    const resp = await redis.setex(id, exp, obj);
    return resp === "OK";
  } catch (err: any) {
    console.log("Error occured while storing sessions", err.message);
    return false;
  }
};

export const storeSession = async (id: string, object: any) => {
  return await storeToRedis(id, oneDay * 30, {
    ...object,
    expiresOn: new Date().getTime() + oneDay * 30 * 1000,
  });
};

type ReturnType<T> = T extends undefined ? Session : T;

export const getSession = async <T = undefined>(
  id: string
): Promise<{ success: boolean; result: ReturnType<T> | null }> => {
  try {
    const session = (await redis.get(id)) as ReturnType<T>;
    return { success: true, result: session };
  } catch (err) {
    console.log("Error getting sessions", err);
    return { success: false, result: null };
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
