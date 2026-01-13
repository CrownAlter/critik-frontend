import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  TokenRefreshResponse
} from './auth.models';
import { TokenStorage } from './token.storage';

/**
 * Central authentication service.
 *
 * Responsibilities:
 * - Call `/auth/*` endpoints
 * - Store/remove tokens
 * - Expose a small reactive auth state for the UI
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Best-effort current username (decoded from stored auth state).
   *
   * NOTE: The backend primarily uses access tokens; if tokens are absent we return null.
   * @returns The current username or null if not logged in.
   */
  getCurrentUsername(): string | null {
    return this.tokenStorage.getUsername();
  }

  /**
   * Retrieves the current user's ID from storage.
   * @returns The user ID or null if not available.
   */
  getCurrentUserId(): number | null {
    return this.tokenStorage.getUserId();
  }

  private readonly baseUrl = environment.apiBaseUrl;

  private readonly _username = signal<string | null>(null);
  readonly username = computed(() => this._username());

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorage
  ) {
    // Best-effort: if we have a token stored, mark as "signed in".
    // The app will still handle 401s via the interceptor.
    if (this.tokenStorage.getAccessToken()) {
      // Restore username if we have it.
      this._username.set(this.tokenStorage.getUsername() ?? '');
    }
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns True if an access token is present, false otherwise.
   */
  isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  /**
   * Registers a new user.
   * @param body The registration request data.
   * @returns An observable with the server response.
   */
  register(body: RegisterRequest) {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/register`, body)
      .pipe(catchError((err) => {
        // Pass errors to caller (UI will show validation messages)
        throw err;
      }));
  }

  /**
   * Logs in a user.
   * Updates local storage with tokens and user info upon success.
   * @param body The login request data.
   * @returns An observable with the authentication response.
   */
  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, body).pipe(
      tap((res) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
        this.tokenStorage.setUsername(res.username);
        this.tokenStorage.setUserId(res.userId);
        this._username.set(res.username);
      })
    );
  }

  /**
   * Attempt to refresh the access token.
   *
   * Returns `null` when there is no refresh token available.
   */
  refreshToken(): import('rxjs').Observable<TokenRefreshResponse | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    // If the user has no refresh token, the interceptor will not retry the request.
    if (!refreshToken) {
      return of(null);
    }

    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<TokenRefreshResponse>(`${this.baseUrl}/auth/refresh`, body).pipe(
      tap((res) => {
        this.tokenStorage.setAccessToken(res.accessToken);
        this.tokenStorage.setRefreshToken(res.refreshToken);
      })
    );
  }

  logout() {
    const refreshToken = this.tokenStorage.getRefreshToken();

    // Even if we don't have a refresh token, we clear local state.
    if (!refreshToken) {
      this.tokenStorage.clear();
      this._username.set(null);
      return of({ message: 'Logged out' });
    }

    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout`, body).pipe(
      tap(() => {
        this.tokenStorage.clear();
        this._username.set(null);
      }),
      catchError((err) => {
        // If server rejects the logout request, still clear local state.
        this.tokenStorage.clear();
        this._username.set(null);
        return of({ message: 'Logged out' });
      })
    );
  }

  logoutAll() {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout-all`, {}).pipe(
      tap(() => {
        this.tokenStorage.clear();
        this._username.set(null);
      }),
      catchError((err) => {
        // Same fallback behavior.
        this.tokenStorage.clear();
        this._username.set(null);
        return of({ message: 'Logged out' });
      })
    );
  }
}
