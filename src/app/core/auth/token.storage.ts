import { Injectable } from '@angular/core';

/**
 * Very small token persistence layer.
 *
 * NOTE:
 * The backend documentation recommends keeping the access token in memory only.
 * For a typical SPA, we still persist it to `sessionStorage` so page refresh doesn't log the user out.
 * If you want stricter security, we can switch to in-memory storage.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly accessKey = 'critik_access_token';
  private readonly refreshKey = 'critik_refresh_token';
  private readonly usernameKey = 'critik_username';
  private readonly userIdKey = 'critik_user_id';

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessKey);
  }

  setAccessToken(token: string | null): void {
    if (!token) {
      sessionStorage.removeItem(this.accessKey);
      return;
    }
    sessionStorage.setItem(this.accessKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  setRefreshToken(token: string | null): void {
    if (!token) {
      localStorage.removeItem(this.refreshKey);
      return;
    }
    localStorage.setItem(this.refreshKey, token);
  }

  getUsername(): string | null {
    return sessionStorage.getItem(this.usernameKey);
  }

  setUsername(username: string | null): void {
    if (!username) {
      sessionStorage.removeItem(this.usernameKey);
      return;
    }
    sessionStorage.setItem(this.usernameKey, username);
  }

  getUserId(): number | null {
    const raw = sessionStorage.getItem(this.userIdKey);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }

  setUserId(userId: number | null): void {
    if (userId === null || userId === undefined) {
      sessionStorage.removeItem(this.userIdKey);
      return;
    }
    sessionStorage.setItem(this.userIdKey, String(userId));
  }

  clear(): void {
    sessionStorage.removeItem(this.accessKey);
    sessionStorage.removeItem(this.usernameKey);
    sessionStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.refreshKey);
  }
}
