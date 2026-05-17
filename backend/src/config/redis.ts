import Redis from "ioredis";

let client: Redis | null = null;
let isReady = false;

function getClient(): Redis | null {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[Redis] REDIS_URL not set — caching disabled");
    return null;
  }

  client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: false,
  });

  client.on("connect", () => {
    isReady = true;
    console.log("[Redis] Connected successfully");
  });

  client.on("error", (err: Error) => {
    console.error("[Redis] Connection error:", err.message);
    isReady = false;
  });

  client.on("close", () => {
    isReady = false;
  });

  return client;
}

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  try {
    const c = getClient();
    if (!c || !isReady) return null;
    const raw = await c.get(key);
    if (!raw) {
      console.log(`[Redis] cache miss → ${key}`);
      return null;
    }
    console.log(`[Redis] cache hit  → ${key}`);
    return JSON.parse(raw) as T;
  } catch (err: any) {
    console.error("[Redis] getCache error:", err.message);
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const c = getClient();
    if (!c || !isReady) return;
    await c.set(key, JSON.stringify(value), "EX", ttlSeconds);
    console.log(`[Redis] cached      → ${key} (TTL ${ttlSeconds}s)`);
  } catch (err: any) {
    console.error("[Redis] setCache error:", err.message);
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    const c = getClient();
    if (!c || !isReady) return;
    const pipeline = c.pipeline();
    keys.forEach((k) => pipeline.del(k));
    await pipeline.exec();
    console.log(`[Redis] invalidated → ${keys.join(", ")}`);
  } catch (err: any) {
    console.error("[Redis] invalidateCache error:", err.message);
  }
}

export async function invalidateByPrefix(prefix: string): Promise<void> {
  try {
    const c = getClient();
    if (!c || !isReady) return;
    const keys = await c.keys(prefix);
    if (keys.length) {
      await c.del(...keys);
      console.log(`[Redis] invalidated ${keys.length} keys matching ${prefix}`);
    }
  } catch (err: any) {
    console.error("[Redis] invalidateByPrefix error:", err.message);
  }
}

// Eagerly connect on import
getClient();
