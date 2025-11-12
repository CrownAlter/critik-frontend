import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../../core/user/user.model';
import { ArtworkSummary } from '../artworks/artwork-model';

export interface ProfileResponse {
  user: UserProfile;
  artworks: ArtworkSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/${username}`);
  }

  updateProfile(id: number, data: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.base}/${id}/edit`, data);
  }

  
}
