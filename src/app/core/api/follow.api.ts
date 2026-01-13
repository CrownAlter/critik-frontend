import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User } from './api.models';

/**
 * API client for follow endpoints.
 *
 * Backend controller: `FollowController`.
 */
@Injectable({ providedIn: 'root' })
export class FollowApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  follow(userId: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/follow/${userId}`, null);
  }

  unfollow(userId: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/follow/${userId}`);
  }

  followers(userId: number) {
    return this.http.get<User[]>(`${this.baseUrl}/follow/${userId}/followers`);
  }

  following(userId: number) {
    return this.http.get<User[]>(`${this.baseUrl}/follow/${userId}/following`);
  }
}
