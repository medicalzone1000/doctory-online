// ─────────────────────────────────────────
//  HTTP CLIENT
//  All API calls must go through here
// ─────────────────────────────────────────

import { API_BASE_URL, API_TIMEOUT } from '../../config/constants.js';
import authService from '../services/auth.service.js';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name    = 'ApiError';
    this.status  = status;
    this.data    = data;
  }
}

class HttpClient {
  #baseUrl;
  #timeout;
  #requestInterceptors  = [];
  #responseInterceptors = [];

  constructor(baseUrl, timeout = API_TIMEOUT) {
    this.#baseUrl  = baseUrl;
    this.#timeout  = timeout;
  }

  /** Add a request interceptor */
  onRequest(fn) {
    this.#requestInterceptors.push(fn);
    return this;
  }

  /** Add a response interceptor */
  onResponse(fn) {
    this.#responseInterceptors.push(fn);
    return this;
  }

  /** Build full URL */
  #url(path) {
    return path.startsWith('http') ? path : `${this.#baseUrl}${path}`;
  }

  /** Build default headers */
  #headers(extra = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...extra,
    };
    const token = authService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /** Core fetch with timeout */
  async #fetch(url, options) {
    // Apply request interceptors
    let config = { url, ...options };
    for (const interceptor of this.#requestInterceptors) {
      config = await interceptor(config);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeout);

    try {
      let response = await fetch(config.url, {
        ...config,
        signal: controller.signal,
      });

      // Apply response interceptors
      for (const interceptor of this.#responseInterceptors) {
        response = await interceptor(response) || response;
      }

      // Handle 401 - token expired
      if (response.status === 401) {
        authService.clearSession();
        authService.redirectToLogin('session_expired');
        throw new ApiError('Session expired', 401, null);
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message = data?.message || data?.error || `HTTP ${response.status}`;
        throw new ApiError(message, response.status, data);
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out', 408, null);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** GET request */
  get(path, params = {}, headers = {}) {
    const url = new URL(this.#url(path));
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        url.searchParams.set(k, v);
      }
    });
    return this.#fetch(url.toString(), {
      method: 'GET',
      headers: this.#headers(headers),
    });
  }

  /** POST request */
  post(path, body = {}, headers = {}) {
    return this.#fetch(this.#url(path), {
      method:  'POST',
      headers: this.#headers(headers),
      body:    JSON.stringify(body),
    });
  }

  /** PUT request */
  put(path, body = {}, headers = {}) {
    return this.#fetch(this.#url(path), {
      method:  'PUT',
      headers: this.#headers(headers),
      body:    JSON.stringify(body),
    });
  }

  /** PATCH request */
  patch(path, body = {}, headers = {}) {
    return this.#fetch(this.#url(path), {
      method:  'PATCH',
      headers: this.#headers(headers),
      body:    JSON.stringify(body),
    });
  }

  /** DELETE request */
  delete(path, headers = {}) {
    return this.#fetch(this.#url(path), {
      method:  'DELETE',
      headers: this.#headers(headers),
    });
  }

  /** Upload form data (multipart) */
  upload(path, formData, headers = {}) {
    const h = this.#headers(headers);
    delete h['Content-Type']; // let browser set multipart boundary
    return this.#fetch(this.#url(path), {
      method:  'POST',
      headers: h,
      body:    formData,
    });
  }
}

export const client = new HttpClient(API_BASE_URL);
export { ApiError };
export default client;