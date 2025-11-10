export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const USER = 'user';

export const commonSettings = {
  setStorage(name: string, data: unknown, ttl?: number) {
    if (typeof window === 'undefined') return;
    const item: { value: unknown; expiry?: number } = { value: data };
    if (ttl) item.expiry = Date.now() + ttl;
    localStorage.setItem(name, JSON.stringify(item));
  },

  getStorage<T = unknown>(name: string): T | null {
    if (typeof window === 'undefined') return null;
    const itemStr = localStorage.getItem(name);
    if (!itemStr) return null;
    try {
      const item = JSON.parse(itemStr);
      if (item?.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(name);
        return null;
      }
      return (item?.value as T) ?? null;
    } catch (error) {
      console.error(`[commonSettings] Error parsing storage for key: ${name}`, error);
      return null;
    }
  },

  setStorageJson(name: string, data: unknown) {
    localStorage.setItem(name, JSON.stringify(data));
  },

  getStorageJson<T = unknown>(name: string): T | null {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[commonSettings] Error parsing JSON storage for key: ${name}`, error);
      return null;
    }
  },

  clearStorageItem(name: string) {
    localStorage.removeItem(name);
  },

  clearStorage() {
    localStorage.clear();
  },

  setCookieJson(name: string, value: unknown, hours: number) {
    if (typeof window === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; SameSite=None; Secure; expires=${date.toUTCString()}`;
  },

  getCookieJson<T = unknown>(name: string): T | null {
    if (typeof window === 'undefined') return null;
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith(nameEQ)) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length))) as T;
        } catch (error) {
          console.error(`[commonSettings] Error parsing JSON cookie for key: ${name}`, error);
          return null;
        }
      }
    }
    return null;
  },

  getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith(nameEQ)) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  },

  eraseCookie(name: string) {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure;`;
  },

  clearCookies() {
if (typeof window === 'undefined') return;
    for (const cookie of document.cookie.split(';')) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      this.eraseCookie(name.trim());
    }
  },

  clearAll() {
    this.clearStorage();
    this.clearCookies();
  },
};