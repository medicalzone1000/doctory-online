// ─────────────────────────────────────────
//  APP STATE STORE
//  Lightweight unidirectional state management
// ─────────────────────────────────────────

const initialState = {
  user:        null,
  isAuth:      false,
  articles:    [],
  article:     null,
  users:       [],
  totalPages:  1,
  currentPage: 1,
  loading:     false,
  error:       null,
  filters: {
    category: '',
    search:   '',
    status:   '',
    sort:     'newest',
  },
};

class Store {
  #state;
  #listeners = new Map();

  constructor(initial) {
    this.#state = { ...initial };
  }

  /** Get current state (or a specific key) */
  get(key) {
    return key ? this.#state[key] : { ...this.#state };
  }

  /** Update state and notify subscribers */
  set(patch) {
    const prev = { ...this.#state };
    this.#state = { ...this.#state, ...patch };

    // Notify relevant listeners
    Object.keys(patch).forEach(key => {
      if (this.#listeners.has(key)) {
        this.#listeners.get(key).forEach(fn => fn(this.#state[key], prev[key]));
      }
    });
    // Notify wildcard listeners
    if (this.#listeners.has('*')) {
      this.#listeners.get('*').forEach(fn => fn(this.#state, prev));
    }
  }

  /** Subscribe to state changes */
  subscribe(key, fn) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    this.#listeners.get(key).add(fn);
    // Return unsubscribe function
    return () => this.#listeners.get(key)?.delete(fn);
  }

  /** Reset state to initial */
  reset(keys) {
    if (keys) {
      const patch = {};
      keys.forEach(k => { patch[k] = initialState[k]; });
      this.set(patch);
    } else {
      this.#state = { ...initialState };
      this.#listeners.get('*')?.forEach(fn => fn(this.#state, {}));
    }
  }
}

export const store = new Store(initialState);
export default store;