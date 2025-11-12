import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from './user/user.model';

export interface LoginResponse {
  token?: string;
  userId: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private tokenKey = 'critik_token';
  private usernameKey = 'critik_username';
  private userIdKey = 'critik_user_id';

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  readonly isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(private http: HttpClient) {
    // Initialize auth state only in browser
    if (typeof window !== 'undefined') {
      this.loggedIn$.next(!!this.getToken());
    }
  }

  register(payload: { username: string; email: string; password: string }) {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  login(payload: { username: string; password: string }) {
  return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
    tap(res => {
      if (res?.token) this.setToken(res.token);
      if (res?.username) localStorage.setItem(this.usernameKey, res.username);
      if (res?.userId) localStorage.setItem(this.userIdKey, String(res.userId));
      this.loggedIn$.next(true);
    })
  );
}


  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.usernameKey);
      localStorage.removeItem(this.userIdKey);
    }
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;
  }

  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setUserId(id: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userIdKey, id.toString());
    }
  }

  getUsername(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(this.usernameKey) : null;
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? Number(id) : null;
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}