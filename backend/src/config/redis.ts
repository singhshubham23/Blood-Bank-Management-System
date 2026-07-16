import Redis from "ioredis";

let client: Redis | null = null;
let isReady = false;
let isDisabled = false;
let connectAttempted = false;

function shouldDisableRedis(err?: Error | null): boolean {
  if (!err) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("enotfound") ||
    message.includes("eai_again") ||
    message.includes("getaddrinfo") ||
    message.includes("econrefused")
  );
}

function disableRedis(reason: string) {
  if (isDisabled) return;
  isDisabled = true;
  isReady = false;
  console.warn(`[Redis] Disabled caching: ${reason}`);
  if (client) {
    client.removeAllListeners();
    client.disconnect();
    client = null;
  }
}

function getClient(): Redis | null {
  if (isDisabled) return null;
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[Redis] REDIS_URL not set — caching disabled");
    isDisabled = true;
    return null;
  }

  // Avoid reconnect storms if the URL is invalid or the provider is down.
  client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    retryStrategy(times: number) {
      if (times > 2) return null;
      return Math.min(times * 250, 1000);
    },
    lazyConnect: true,
  });

  client.on("connect", () => {
    isReady = true;
    connectAttempted = true;
    console.log("[Redis] Connected successfully");
  });

  client.on("error", (err: Error) => {
    console.error("[Redis] Connection error:", err.message);
    isReady = false;
    connectAttempted = true;
    if (shouldDisableRedis(err)) {
      disableRedis(err.message);
    }
  });

  client.on("close", () => {
    isReady = false;
  });

  return client;
}

async function ensureConnected(): Promise<Redis | null> {
  const c = getClient();
  if (!c || isDisabled) return null;
  if (isReady) return c;
  if (connectAttempted) return null;

  connectAttempted = true;
  try {
    await c.connect();
    return c;
  } catch (err: any) {
    console.error("[Redis] connect error:", err.message);
    if (shouldDisableRedis(err)) {
      disableRedis(err.message);
    }
    return null;
  }
}

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  try {
    const c = await ensureConnected();
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
    const c = await ensureConnected();
    if (!c || !isReady) return;
    await c.set(key, JSON.stringify(value), "EX", ttlSeconds);
    console.log(`[Redis] cached      → ${key} (TTL ${ttlSeconds}s)`);
  } catch (err: any) {
    console.error("[Redis] setCache error:", err.message);
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    const c = await ensureConnected();
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
    const c = await ensureConnected();
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
