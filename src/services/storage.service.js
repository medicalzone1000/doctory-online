// ─────────────────────────────────────────
//  STORAGE SERVICE
//  Abstraction over localStorage / sessionStorage
// ─────────────────────────────────────────

class StorageService {
  #storage;

  constructor(storage = localStorage) {
    this.#storage = storage;
  }

  /**
   * Set a value (serializes objects/arrays to JSON)
   */
  set(key, value) {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      this.#storage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.error('[Storage] set failed:', err);
      return false;
    }
  }

  /**
   * Get a value (deserializes JSON if possible)
   */
  get(key, fallback = null) {
    try {
      const raw = this.#storage.getItem(key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); }
      catch { return raw; }
    } catch (err) {
      console.error('[Storage] get failed:', err);
      return fallback;
    }
  }

  /**
   * Remove a value
   */
  remove(key) {
    try { this.#storage.removeItem(key); return true; }
    catch { return false; }
  }

  /**
   * Clear all values
   */
  clear() {
    try { this.#storage.clear(); return true; }
    catch { return false; }
  }

  /**
   * Check if a key exists
   */
  has(key) {
    return this.#storage.getItem(key) !== null;
  }

  /**
   * Get all keys
   */
  keys() {
    return Object.keys(this.#storage);
  }
}

export const localStorage_  = new StorageService(window.localStorage);
export const sessionStorage_ = new StorageService(window.sessionStorage);

export default localStorage_;