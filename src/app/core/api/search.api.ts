import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Artwork, User } from './api.models';

/**
 * API client for `/search/*` endpoints.
 *
 * Backend controller: `SearchController`.
 */
@Injectable({ providedIn: 'root' })
export class SearchApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  users(q: string) {
    return this.http.get<User[]>(`${this.baseUrl}/search/users`, {
      params: new HttpParams().set('q', q)
    });
  }

  artworks(filters: { title?: string; location?: string; tags?: string }) {
    let params = new HttpParams();
    if (filters.title) params = params.set('title', filters.title);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.tags) params = params.set('tags', filters.tags);

    return this.http.get<Artwork[]>(`${this.baseUrl}/search/artworks`, { params });
  }
}
