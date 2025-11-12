import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../core/user/user.model';
import { ArtworkSummary } from '../artworks/artwork-model';

@Injectable({ providedIn: 'root' })
export class SearchService {

  private base = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  // Search for users
  searchUsers(query: string): Observable<UserProfile[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserProfile[]>(`${this.base}/users`, { params });
  }

  // Search for artworks
  searchArtworks(filters: { title?: string; location?: string; tags?: string }): Observable<ArtworkSummary[]> {
    let params = new HttpParams();
    if (filters.title) params = params.set('title', filters.title);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.tags) params = params.set('tags', filters.tags);

    return this.http.get<ArtworkSummary[]>(`${this.base}/artworks`, { params });
  }

  // Combined search (for universal search bar)
  searchAll(query: string): Observable<{ users: UserProfile[]; artworks: ArtworkSummary[] }> {
    return forkJoin({
      users: this.searchUsers(query),
      artworks: this.searchArtworks({ title: query, tags: query })
    });
  }
}
