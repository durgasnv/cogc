import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

let _client = null;
const _memoryFallback = new Map();
let _loadedFromDisk = false;

// Default persistent storage file path
const DB_FILE_PATH = path.join(process.cwd(), 'lib', 'data', 'tournament-db.json');

/**
 * Initializes and loads existing database from disk into memory
 */
function initDiskStorage() {
  if (_loadedFromDisk) return;
  _loadedFromDisk = true;

  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && value.__type === 'Set') {
          _memoryFallback.set(key, new Set(value.items));
        } else {
          _memoryFallback.set(key, value);
        }
      }
      console.log(`[Database] Loaded ${_memoryFallback.size} keys from persistent local storage.`);
    } else {
      saveToDiskSync();
    }
  } catch (err) {
    console.error('[Database] Failed to load local database from disk:', err);
  }
}

/**
 * Persists the current in-memory database to disk safely
 */
let _saveTimeout = null;
function persistToDisk() {
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    saveToDiskSync();
  }, 100);
}

function saveToDiskSync() {
  try {
    const serialized = {};
    for (const [key, value] of _memoryFallback.entries()) {
      if (value instanceof Set) {
        serialized[key] = { __type: 'Set', items: Array.from(value) };
      } else {
        serialized[key] = value;
      }
    }
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(serialized, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
  } catch (err) {
    console.error('[Database] Error saving local database to disk:', err);
  }
}

/**
 * Creates Redis client (Upstash) or falls back to persistent local offline database
 */
export function kv() {
  if (_client) return _client;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    _client = new Redis({ url, token });
    return _client;
  }

  initDiskStorage();

  // Persistent Local Offline Database Client
  const persistentLocalDb = {
    async get(key) {
      initDiskStorage();
      return _memoryFallback.has(key) ? _memoryFallback.get(key) : null;
    },
    async set(key, value) {
      initDiskStorage();
      _memoryFallback.set(key, value);
      persistToDisk();
      return 'OK';
    },
    async del(key) {
      initDiskStorage();
      const existed = _memoryFallback.delete(key);
      if (existed) persistToDisk();
      return existed ? 1 : 0;
    },
    async keys(pattern = '*') {
      initDiskStorage();
      const all = Array.from(_memoryFallback.keys());
      if (pattern === '*') return all;
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return all.filter((k) => regex.test(k));
    },
    async mget(...keys) {
      initDiskStorage();
      return keys.map((k) => (_memoryFallback.has(k) ? _memoryFallback.get(k) : null));
    },
    async sadd(key, ...members) {
      initDiskStorage();
      const set = _memoryFallback.get(key) || new Set();
      members.forEach((m) => set.add(m));
      _memoryFallback.set(key, set);
      persistToDisk();
      return members.length;
    },
    async smembers(key) {
      initDiskStorage();
      const set = _memoryFallback.get(key);
      return set ? Array.from(set) : [];
    },
    async srem(key, ...members) {
      initDiskStorage();
      const set = _memoryFallback.get(key);
      if (!set) return 0;
      let count = 0;
      members.forEach((m) => {
        if (set.delete(m)) count++;
      });
      if (count > 0) persistToDisk();
      return count;
    },
    /**
     * Flushes all persisted database state (useful for admin tournament reset)
     */
    async flushall() {
      _memoryFallback.clear();
      saveToDiskSync();
      return 'OK';
    },
  };

  return persistentLocalDb;
}
