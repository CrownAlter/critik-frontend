import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { ReactionCounts, ReactionType, UserReactionResponse } from './api.models';

/**
 * API client for reactions.
 *
 * Backend controller: `ReactionController`.
 */
@Injectable({ providedIn: 'root' })
export class ReactionsApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  counts(artworkId: number) {
    return this.http.get<ReactionCounts>(`${this.baseUrl}/artworks/${artworkId}/reactions`);
  }

  me(artworkId: number) {
    return this.http.get<UserReactionResponse>(`${this.baseUrl}/artworks/${artworkId}/reactions/me`);
  }

  set(artworkId: number, type: ReactionType) {
    const params = new HttpParams().set('type', type);
    return this.http.post<{ message: string; type: ReactionType }>(
      `${this.baseUrl}/artworks/${artworkId}/reactions`,
      null,
      { params }
    );
  }

  remove(artworkId: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/artworks/${artworkId}/reactions`);
  }
}
