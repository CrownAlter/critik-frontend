/**
 * Models that match the backend's DTOs.
 *
 * Source:
 * - `AuthResponse.java`
 * - `TokenRefreshResponse.java`
 */

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer' | string;
  /** Access token expiration time in seconds */
  expiresIn: number;
  userId: number;
  username: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer' | string;
  /** Access token expiration time in seconds */
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
