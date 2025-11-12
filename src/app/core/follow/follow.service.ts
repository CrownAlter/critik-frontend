import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../user/user.model';

@Injectable({ providedIn: 'root' })
export class FollowService {

  // ✅ Correct base URL points to the backend FollowController mapping
  private base = `${environment.apiUrl}/follow`;

  constructor(private http: HttpClient) {}

  // ✅ POST /follow/{followerId}/follow/{followedId}
  followUser(followerId: number, followedId: number): Observable<string> {
    return this.http.post(
      `${this.base}/${followerId}/follow/${followedId}`,
      {},
      { responseType: 'text' }
    );
  }

  // ✅ DELETE /follow/{followerId}/unfollow/{followedId}
  unfollowUser(followerId: number, followedId: number): Observable<string> {
    return this.http.delete(
      `${this.base}/${followerId}/unfollow/${followedId}`,
      { responseType: 'text' }
    );
  }

  // ✅ GET /follow/{userId}/followers
  getFollowers(userId: number): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.base}/${userId}/followers`);
  }

  // ✅ GET /follow/{userId}/following
  getFollowing(userId: number): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.base}/${userId}/following`);
  }
}
