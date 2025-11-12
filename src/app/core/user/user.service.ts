import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserProfile } from './user.model';
import { Observable } from 'rxjs';
import { ArtworkSummary } from '../../features/artworks/artwork-model';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUserProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.base}/${username}`);
  }

  getUserArtworks(username: string): Observable<ArtworkSummary[]> {
    return this.http.get<ArtworkSummary[]>(`${this.base}/${username}/artworks`);
  }
}
