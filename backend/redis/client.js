const { createClient } = require('redis');

let activeClient = null;
let isFallbackActive = false;
const inMemoryStore = new Map();

// High-fidelity fallback client mimicking Redis basic operations
const inMemoryFallbackClient = {
  get: async (key) => {
    return inMemoryStore.get(key) || null;
  },
  set: async (key, value) => {
    inMemoryStore.set(key, value);
    return 'OK';
  },
  del: async (key) => {
    const existed = inMemoryStore.has(key);
    inMemoryStore.delete(key);
    return existed ? 1 : 0;
  },
  connect: async () => {
    console.log('⚡ Redis mock connected (In-memory fallback active)');
    return true;
  }
};

async function initRedis() {
  if (process.env.USE_REDIS === 'false') {
    console.log('⚡ Redis cache is bypassed via config. Booting cleanly with high-fidelity in-memory fallback cache.');
    isFallbackActive = true;
    activeClient = inMemoryFallbackClient;
    return;
  }

  const redisUri = process.env.REDIS_URI || 'redis://127.0.0.1:6379';
  console.log(`📡 Attempting to connect to Redis at ${redisUri}...`);

  const realClient = createClient({
    url: redisUri,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries >= 2) {
          console.warn('⚠️ Redis reconnection failed. Permanently switching to in-memory fallback cache.');
          isFallbackActive = true;
          activeClient = inMemoryFallbackClient;
          return false; // Stop reconnecting
        }
        return 1000; // Retry after 1 second
      }
    }
  });

  realClient.on('error', (err) => {
    console.warn('❌ Redis connection error:', err.message);
    if (!isFallbackActive) {
      console.warn('⚠️ Falling back to in-memory client.');
      isFallbackActive = true;
      activeClient = inMemoryFallbackClient;
    }
  });

  try {
    await realClient.connect();
    if (!isFallbackActive) {
      activeClient = realClient;
      console.log('⚡ Connected to Redis Server successfully');
    }
  } catch (error) {
    console.warn('❌ Failed to establish initial Redis connection:', error.message);
    console.warn('⚠️ Falling back to in-memory client.');
    isFallbackActive = true;
    activeClient = inMemoryFallbackClient;
  }
}

// Transparent delegator client that safely maps calls to the active client
const redisClient = {
  get: async (key) => {
    if (!activeClient) {
      return inMemoryStore.get(key) || null;
    }
    try {
      return await activeClient.get(key);
    } catch (err) {
      console.error('❌ Redis GET error:', err.message);
      return inMemoryStore.get(key) || null;
    }
  },
  set: async (key, value) => {
    if (!activeClient) {
      inMemoryStore.set(key, value);
      return 'OK';
    }
    try {
      return await activeClient.set(key, value);
    } catch (err) {
      console.error('❌ Redis SET error:', err.message);
      inMemoryStore.set(key, value);
      return 'OK';
    }
  },
  del: async (key) => {
    if (!activeClient) {
      const existed = inMemoryStore.has(key);
      inMemoryStore.delete(key);
      return existed ? 1 : 0;
    }
    try {
      return await activeClient.del(key);
    } catch (err) {
      console.error('❌ Redis DEL error:', err.message);
      const existed = inMemoryStore.has(key);
      inMemoryStore.delete(key);
      return existed ? 1 : 0;
    }
  }
};

module.exports = {
  redisClient,
  initRedis
};
