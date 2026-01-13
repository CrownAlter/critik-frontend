import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { ProfileResponse, User } from './api.models';

/**
 * API client for profile endpoints.
 * Handles fetching user profiles and updating user details.
 *
 * Backend controller: `ProfileController`.
 */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) { }

  /**
   * Fetches the public profile of a user by username.
   * @param username The username to look up.
   * @returns An observable containing the user's profile data.
   */
  getByUsername(username: string) {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/users/${encodeURIComponent(username)}`);
  }

  /**
   * Updates the current user's profile information.
   * @param userId The ID of the user.
   * @param patch An object containing the fields to update.
   * @returns An observable containing the updated user data.
   */
  update(userId: number, patch: { displayName?: string | null; email?: string | null; bio?: string | null }) {
    return this.http.put<User>(`${this.baseUrl}/users/${userId}/edit`, patch);
  }
}
