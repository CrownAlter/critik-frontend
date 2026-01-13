import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Small API wrapper for auth endpoints that aren't part of the interactive login page.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Logout from all devices.
   *
   * Backend: POST `/auth/logout-all`
   */
  logoutAll() {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout-all`, {});
  }
}
