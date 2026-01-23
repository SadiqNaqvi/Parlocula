"use server";

import { oneDay } from "@lib/constants";
import { getRedis, handleParsing } from "@lib/providers/redis";
import { Session } from "@type/internal";

export const storeToRedis = async (
  id: string,
  exp: number,
  obj: Record<string, any>
) => {
  try {
    const redis = await getRedis();
    const resp = await redis.setex(`session:${id}`, exp, JSON.stringify(obj));
    return resp === "OK";
  } catch (err: any) {
    console.log("Error occured while storing sessions", err.message);
    return false;
  }
};

export const storeSession = async (id: string, object: Omit<Session, "expireOn">) => {
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
    const redis = await getRedis();
    const session = (await redis.get(`session:${id}`)) as ReturnType<T>;
    return { success: true, result: handleParsing(session) };
  } catch (err) {
    console.log("Error getting sessions", err);
    return { success: false, result: null };
  }
};

export const deleteSession = async (id: string) => {
  try {
    const redis = await getRedis();
    return !!(await redis.del(`session:${id}`));
  } catch (err) {
    console.error("Error occured while deleting session:", err);
    return false;
  }
};
