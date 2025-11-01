// Cookie Service for managing browser cookies

interface CookieOptions {
  maxAge?: number; // in seconds
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

class CookieService {
  /**
   * Set a cookie
   */
  setCookie(name: string, value: string, options?: CookieOptions): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options) {
      if (options.maxAge) {
        cookieString += `; Max-Age=${options.maxAge}`;
      }
      if (options.expires) {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      if (options.secure) {
        cookieString += '; Secure';
      }
      if (options.sameSite) {
        cookieString += `; SameSite=${options.sameSite}`;
      }
    } else {
      // Default: 30 days, path root, SameSite Lax
      const date = new Date();
      date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
      cookieString += '; path=/';
      cookieString += '; SameSite=Lax';
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie by name
   */
  getCookie(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Delete a cookie
   */
  deleteCookie(name: string): void {
    this.setCookie(name, '', {
      maxAge: 0,
      path: '/'
    });
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  getAllCookies(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  /**
   * Save user preferences
   */
  saveUserPreferences(darkMode: boolean, language?: string): void {
    this.setCookie('darkMode', JSON.stringify(darkMode), {
      maxAge: 365 * 24 * 60 * 60 // 1 year
    });

    if (language) {
      this.setCookie('language', language, {
        maxAge: 365 * 24 * 60 * 60
      });
    }
  }

  /**
   * Load user preferences
   */
  loadUserPreferences(): { darkMode: boolean; language?: string } {
    const darkModeStr = this.getCookie('darkMode');
    const language = this.getCookie('language') || undefined;

    return {
      darkMode: darkModeStr ? JSON.parse(darkModeStr) : false,
      language
    };
  }

  /**
   * Save search history (last 10 searches)
   */
  saveSearchHistory(query: string): void {
    let history = this.getCookie('searchHistory');
    let searchArray: string[] = history ? JSON.parse(history) : [];

    // Add new search if not duplicate
    if (!searchArray.includes(query)) {
      searchArray.unshift(query);
      // Keep only last 10 searches
      searchArray = searchArray.slice(0, 10);
      this.setCookie('searchHistory', JSON.stringify(searchArray), {
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    const history = this.getCookie('searchHistory');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.deleteCookie('searchHistory');
  }

  /**
   * Save theme preference
   */
  saveTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.setCookie('theme', theme, {
      maxAge: 365 * 24 * 60 * 60
    });
  }

  /**
   * Load theme preference
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    return (this.getCookie('theme') as 'light' | 'dark' | 'auto') || 'auto';
  }

  /**
   * Save last visited section
   */
  saveLastVisitedSection(section: string): void {
    this.setCookie('lastSection', section, {
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
  }

  /**
   * Get last visited section
   */
  getLastVisitedSection(): string | null {
    return this.getCookie('lastSection');
  }
}

export default new CookieService();
