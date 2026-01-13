import Redis, { ChainableCommander } from "ioredis";

declare global {
  // allow global `redis` in dev
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

export const getRedis = async () => {
  if (!global._redis) {
    global._redis = new Redis({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          // Stop retrying
          console.log("❌ Too many attempts to connect to Redis, giving up.");
          return;
        }
        console.warn(`⚠️ Redis retry attempt #${times}`);
        return Math.min(times * 200, 2000); // exponential backoff (200ms → 2s max)
      }
    });
  }
  if (global._redis.status === "end" || global._redis.status === "close")
    await global._redis.connect()
      .then(() => console.log("💪🙌 Redis Connected Successfully 🙌💪"))
      .catch((e: any) => {
        console.log("Redis Connection Failed:", e.message)
        global._redis?.disconnect();
      });
  // }

  return global._redis;
};

/*
  // Listen for errors (avoid flood by not printing stack every time)
  global._redis.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  try {
    await global._redis.connect();
    console.log("💪🙌 Redis Connected Successfully 🙌💪");
  } catch (e: any) {
    console.error("Redis Connection Failed:", e.message);
    global._redis.disconnect();
  }
}
*/

export const handleParsing = (data: any) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export const handlePipelineResponse = <T = unknown>(res: [error: Error | null, result: unknown][] | null): T[] => {
  if (!res) throw new Error("Pipeline returned nothing");

  return res.map(result => {
    const [e, r] = result;
    if (e) throw new Error(e.message);
    else if (Array.isArray(r)) {
      r.map(handleParsing) as T[];
    }
    return handleParsing(r) as T;
  });
}

type RedisJsonCommands =
  | "set"
  | "get"
  | "del"
  | "type"
  | "strLen"
  | "strAppend"
  | "numIncrBy"
  | "numMultBy"
  | "arrAppend"
  | "arrInsert"
  | "arrTrim"
  | "arrPop"
  | "objLen"
  | "objKeys"
  | "objUpdateMulti"
  | "toggle"

type BaseOptions = [path: RedisJsonPath, key: string]

interface RedisJsonOptionsMap extends Record<RedisJsonCommands, [...BaseOptions, ...any] | any[]> {
  get: [...BaseOptions, index?: number]
  set: [...BaseOptions, value: any]
  del: [...BaseOptions, index?: number],
  type: BaseOptions,
  strLen: BaseOptions,
  strAppend: [...BaseOptions, value: string]
  numIncrBy: [...BaseOptions, value: number]
  numMultBy: [...BaseOptions, value: number]
  arrAppend: [...BaseOptions, value: any]
  arrInsert: [...BaseOptions, value: NonNullable<any>, start: number, end: number]
  arrTrim: [...BaseOptions, start: number, end: number]
  arrPop: [...BaseOptions, index?: number]
  objLen: BaseOptions,
  objKeys: BaseOptions,
  objUpdateMulti: [key: string, obj: Record<string, any>]
  toggle: [...BaseOptions, index?: number]
}




type RedisJsonPath = "root" | string

type RedisJsonReturnType<T = unknown, E extends ChainableCommander | Redis = Redis> = E extends Redis ? Promise<T[]> : E

const resolvePath = (path: RedisJsonPath, index?: number) => {
  return `$${index ? `[${index}]` : ''}${path === "root" ? '' : `.${path}`}`
}

export const RedisJson = <E extends Redis | ChainableCommander, T extends RedisJsonCommands = RedisJsonCommands>(redis: E): Record<T, (...options: RedisJsonOptionsMap[T]) => unknown> => {
  if (!redis) throw new Error("You need to pass redis instance to use Redis JSON.")
  return {

    /**
     * Pass index only if the value is type of array and you want to read a single element of the array at the given index.
     * 
     * Reverse indexing is supported
     * 
     * @example
     * -1 for the last element and so on.
     */

    get: <T,>(path: RedisJsonPath, key: string, index?: number) =>
      redis.call("JSON.GET", key, resolvePath(path, index)) as RedisJsonReturnType<T, E>,

    set: (path: RedisJsonPath, key: string, value: any) =>
      redis.call("JSON.SET", key, resolvePath(path), JSON.stringify(value)) as RedisJsonReturnType<"ok", E>,

    /**
     * Pass index only if the type is array and you want to delete a single element of the array at the given index.
     * 
     * Reverse indexing is supported
     * 
     * @example
     * -1 for the last element and so on.
     */

    del: (path: RedisJsonPath, key: string, index?: number) =>
      redis.call("JSON.DEL", key, resolvePath(path, index)),

    type: (path: RedisJsonPath, key: string) =>
      redis.call("JSON.DEL", key, resolvePath(path)),

    strLen: (path: RedisJsonPath, key: string) =>
      redis.call("JSON.STRLEN", key, resolvePath(path)),

    strAppend: (path: RedisJsonPath, key: string, value: string) =>
      redis.call("JSON.STRAPPEND", key, resolvePath(path), value),

    numIncrBy: (path: RedisJsonPath, key: string, value: number) =>
      redis.call("JSON.NUMINCRBY", key, resolvePath(path), value),

    numMultBy: (path: RedisJsonPath, key: string, value: number) =>
      redis.call("JSON.NUMMULTBY", key, resolvePath(path), value),

    arrAppend: (path: RedisJsonPath, key: string, value: any) =>
      redis.call("JSON.ARRAPPEND", key, resolvePath(path), value),

    arrInsert: (path: RedisJsonPath, key: string, value: any, start: number, end: number) =>
      redis.call("JSON.ARRINSERT", key, resolvePath(path), value, start, end),

    arrTrim: (path: RedisJsonPath, key: string, start: number, end: number) =>
      redis.call("JSON.ARRTRIM", key, resolvePath(path), start, end),

    arrPop: (path: RedisJsonPath, key: string, index?: number) =>
      redis.call("JSON.ARRPOP", key, resolvePath(path, index)),

    objLen: (path: RedisJsonPath, key: string) =>
      redis.call("JSON.OBJLEN", key, resolvePath(path)),

    objKeys: (path: RedisJsonPath, key: string) =>
      redis.call("JSON.OBJKEYS", key, resolvePath(path)),

    /*
    * Recommended to use redis multi for this since it will make N requests to redis. N is the number of keys to update
    */

    objUpdateMulti: (key: string, obj: Record<string, any>) =>
      Object.entries(obj).forEach(([k, v]) => {
        redis.call("JSON.SET", key, resolvePath(k), JSON.stringify(v));
      }),

    /**
     * Only works for boolean field.
     */

    toggle: (path: RedisJsonPath, key: string, index?: number) =>
      redis.call("JSON.TOGGLE", key, resolvePath(path, index)),
  } as Record<T, (...options: RedisJsonOptionsMap[T]) => unknown>;
}



export type RedisInstance = Redis;

export type AllowedRedisMethods =
  | "get"
  | "zrange"
  | "zrevrange"
  | "zrangebyscore"
  | "zrevrangebyscore"
  | "lrange"
  | "hgetall"
  | "hget"
  | "hmget"
  | "smembers"
  | "exists"

export type TypedStore = Map<string, unknown>

export interface BaseStage {
  readonly method: string;
}

type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

export interface RedisStage<M extends AllowedRedisMethods = AllowedRedisMethods> extends BaseStage {
  method: M;
  key: string;
  ref?: string;
  options?: Tail<Parameters<RedisInstance[M]>>;
}

export interface RedisJsonStage<C extends RedisJsonCommands = RedisJsonCommands> extends BaseStage {
  method: `json.${C}`,
  key: string;
  ref?: string;
  options: RedisJsonOptionsMap[C],
}

export type ExtendedRedisStage = RedisStage | RedisJsonStage;

export interface ExecuteStage extends BaseStage {
  method: 'execute';
}

export interface ConditionStage extends BaseStage {
  method: 'condition';
  ref?: string;
  validate: (store: TypedStore, val?: any) => boolean | Promise<boolean>;
}

export interface LookupStage extends BaseStage {
  method: 'lookup';
  ref?: string;
  explore: (store: TypedStore, val?: any) => ExtendedRedisStage[] | Promise<ExtendedRedisStage[]>;
}

export interface AddFieldStage extends BaseStage {
  method: 'addField';
  field: string;
  val: (store: TypedStore) => unknown | Promise<unknown>;
}

export type TransformReturnType = { key: string, value: unknown }
export interface TransformStage extends BaseStage {
  method: 'transform';
  ref?: string;
  transform: (store: TypedStore, val?: any) => TransformReturnType[] | Promise<TransformReturnType[]>;
};

export interface ReturnStage<T = unknown> extends BaseStage {
  method: 'return';
  value: (store: TypedStore) => T | Promise<T>;
}

export type Stage<T = unknown> =
  | RedisStage
  | RedisJsonStage
  | ExecuteStage
  | ConditionStage
  | LookupStage
  | AddFieldStage
  | TransformStage
  | ReturnStage<T>;

const isRedisStage = (s: Stage): s is RedisStage => {
  const redisMethods = new Set([
    "get",
    "zrange",
    "zrevrange",
    "zrangebyscore",
    "zrevrangebyscore",
    "lrange",
    "hgetall",
    "hget",
    "hmget",
    "smembers",
    "exists",
  ]);
  return redisMethods.has(s.method);
}

const isRedisJsonStage = (s: Stage): s is RedisJsonStage => {
  return s.method.startsWith('json.');
}

const mapResults = (stack: ExtendedRedisStage[], results: unknown[], store: TypedStore) => {
  if (stack.length !== results.length) throw new Error("");
  stack.forEach((stage, i) => {
    const result = results[i];
    store.set(stage.ref || stage.key, result);
  });
}

function execStage<M extends AllowedRedisMethods>(
  multi: ChainableCommander,
  stage: RedisStage<M>,
) {
  const options = (stage.options ?? []);
  return (multi[stage.method] as any)(stage.key, ...options);
}

const executeStack = async (redis: Redis, stack: ExtendedRedisStage[]) => {
  const multi = redis.multi();
  const ins = RedisJson(multi);

  stack.forEach(stage => {
    if (isRedisJsonStage(stage)) {
      const command = stage.method.replace('json.', '') as RedisJsonCommands;
      const method = ins[command];
      method(...stage.options)
    }
    else execStage(multi, stage);
  });

  return await multi.exec().then(handlePipelineResponse);
}

export const redisAggregator = async <T,>(stages: Stage<T>[]): Promise<T | null> => {

  const redis = await getRedis();

  if (!stages.length || stages[0].method === "execute" || stages[0].method === "return" || stages.at(-1)?.method !== "return") return null;

  const store: TypedStore = new Map();
  let stageStack: ExtendedRedisStage[] = [];
  let returnVal: T | null = null
  try {
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (isRedisStage(stage) || isRedisJsonStage(stage)) {
        stageStack.push(stage);
      }

      else if (stage.method === "condition") {
        const condition = await stage.validate(store, store.get(stage.ref || ""))
        if (!condition) throw new Error(`Condition failed. The condition at stage ${i} failed.`)
      }

      else if (stage.method === "addField") {
        store.set(stage.field, await stage.val(store));
      }

      else if (stage.method === "lookup") {
        const lookedupStages = await stage.explore(store, store.get(stage.ref ?? ""));
        lookedupStages.forEach(stage => {
          stageStack.push(stage);
        });
      }

      else if (stage.method === "transform") {
        const transforms = await stage.transform(store, store.get(stage.ref ?? ""));
        transforms.forEach(transformed => {
          store.set(transformed.key, transformed.value);
        });
      }

      else if (stage.method === "execute") {

        if (!stageStack.length) throw new Error("Unexpected execute stage. There must be at least one stage before an execute stage or between two execute stages.")

        const results = await executeStack(redis, stageStack);

        mapResults(stageStack, results, store);
        stageStack = [];
      }

      else if (stage.method === "return") {
        returnVal = await stage.value(store);
      }
    }

    store.clear();
    return returnVal;
  } catch (err: any) {
    console.error(err.message);
    return null;
  }
}