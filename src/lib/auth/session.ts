import { createClient } from "redis";

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URI,
    port: process.env.REDIS_PORT as number | undefined,
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Connection failed", err);
  redisClient.disconnect();
});
redisClient.on("connect", () => console.log("Redis Connected Successfully"));

export const storeSession = async (id: string, object: any) => {
  if (!redisClient.isOpen) redisClient.connect();
  try {
    const resp = await redisClient.setEx(
      id,
      60 * 60 * 24 * 30,
      JSON.stringify(object)
    );
    if (resp === "OK") return true;
    return false;
  } catch (err) {
    console.log("Error occured while storing sessions", err);
    return false;
  }
};

export const getSession = async (id: string) => {
  if (!redisClient.isOpen) redisClient.connect();
  try {
    const resp = await redisClient.get(id);
    if (resp) return JSON.parse(resp);
    else return null;
  } catch (err) {
    console.log("Error getting sessions", err);
    return null;
  }
};

export const deleteSession = (id: string) => {
  if (!redisClient.isOpen) redisClient.connect();
  redisClient.del(id);
};
