import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Artwork } from './api.models';

/**
 * API client for `/artworks/*` endpoints.
 * Handles all artwork-related network requests including fetching feeds,
 * uploading, updating, and deleting artworks.
 *
 * Backend controller: `ArtworkController`.
 */
@Injectable({ providedIn: 'root' })
export class ArtworksApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) { }

  /**
   * Fetches the global artwork feed.
   * @returns An observable containing an array of artworks.
   */
  getFeed() {
    return this.http.get<Artwork[]>(`${this.baseUrl}/artworks/feed`);
  }

  /**
   * Fetches the artwork feed for a specific user.
   * @param userId The ID of the user.
   * @returns An observable containing an array of artworks.
   */
  getFeedForUser(userId: number) {
    return this.http.get<Artwork[]>(`${this.baseUrl}/artworks/feed/${userId}`);
  }

  /**
   * Fetches the current user's artworks.
   * @returns An observable containing an array of the user's artworks.
   */
  getMyArtworks() {
    return this.http.get<Artwork[]>(`${this.baseUrl}/artworks/my`);
  }

  /**
   * Fetches a single artwork by its ID.
   * @param artworkId The ID of the artwork to fetch.
   * @returns An observable containing the artwork details.
   */
  getById(artworkId: number) {
    return this.http.get<Artwork>(`${this.baseUrl}/artworks/${artworkId}`);
  }

  /**
   * Upload a new artwork.
   *
   * Backend expects multipart/form-data with:
   * - file (required)
   * - title (required)
   * - artistName, locationName, lat, lon, interpretation, tags (optional)
   */
  upload(form: {
    file: File;
    title: string;
    artistName?: string;
    locationName?: string;
    lat?: number;
    lon?: number;
    interpretation?: string;
    tags?: string;
  }) {
    const fd = new FormData();
    fd.set('file', form.file);
    fd.set('title', form.title);

    if (form.artistName) fd.set('artistName', form.artistName);
    if (form.locationName) fd.set('locationName', form.locationName);
    if (form.lat !== undefined) fd.set('lat', String(form.lat));
    if (form.lon !== undefined) fd.set('lon', String(form.lon));
    if (form.interpretation) fd.set('interpretation', form.interpretation);
    if (form.tags) fd.set('tags', form.tags);

    return this.http.post<Artwork>(`${this.baseUrl}/artworks`, fd);
  }

  /**
   * Update an artwork.
   *
   * Backend expects a JSON map with keys:
   * - title, artistName, locationName, lat, lon, interpretation, tags
   */
  update(
    artworkId: number,
    patch: {
      title?: string | null;
      artistName?: string | null;
      locationName?: string | null;
      lat?: number | null;
      lon?: number | null;
      interpretation?: string | null;
      tags?: string | null;
    }
  ) {
    return this.http.put<Artwork>(`${this.baseUrl}/artworks/${artworkId}`, patch);
  }

  delete(artworkId: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/artworks/${artworkId}`);
  }
}
