import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { ProfileApi } from '../../core/api/profile.api';
import { FollowApi } from '../../core/api/follow.api';
import { ProfileResponse } from '../../core/api/api.models';
import { toAbsoluteApiUrl } from '../../core/api/api.util';
import { AuthService } from '../../core/auth/auth.service';

/**
 * User profile page.
 *
 * Backend:
 * - GET `/users/{username}`
 * - POST `/follow/{userId}`
 * - DELETE `/follow/{userId}`
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Profile</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="loading()" class="center">
          <mat-progress-spinner diameter="28"></mat-progress-spinner>
        </div>

        <div *ngIf="error()" class="error">{{ error() }}</div>

        <ng-container *ngIf="profile() as p">
          <div class="row">
            <div>
              <div class="username">@{{ p.user.username }}</div>
              <div class="bio" *ngIf="p.user.bio">{{ p.user.bio }}</div>
            </div>

            <span class="spacer"></span>

            <a
              mat-button
              [routerLink]="['/users', p.user.id, 'followers']"
              [queryParams]="{ username: p.user.username }"
            >
              Followers
              <span *ngIf="followersCount() !== null">({{ followersCount() }})</span>
            </a>
            <a
              mat-button
              [routerLink]="['/users', p.user.id, 'following']"
              [queryParams]="{ username: p.user.username }"
            >
              Following
              <span *ngIf="followingCount() !== null">({{ followingCount() }})</span>
            </a>

            <button
              mat-stroked-button
              color="primary"
              type="button"
              *ngIf="canFollow(p)"
              (click)="toggleFollow(p)"
              [disabled]="followBusy()"
            >
              {{ p.isFollowing ? 'Unfollow' : 'Follow' }}
            </button>
          </div>

          <h3>Artworks</h3>
          <div class="grid" *ngIf="p.artworks.length; else empty">
            <mat-card class="art" *ngFor="let a of p.artworks">
              <img mat-card-image [src]="img(a.imageUrl)" [alt]="a.title" />
              <mat-card-content>
                <div class="title">{{ a.title }}</div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/artworks', a.id]">Open</a>
              </mat-card-actions>
            </mat-card>
          </div>

          <ng-template #empty>
            <div class="hint">No artworks yet.</div>
          </ng-template>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .row {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .spacer {
        flex: 1;
      }
      .username {
        font-weight: 800;
        font-size: 1.1rem;
      }
      .bio {
        opacity: 0.8;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      .art img {
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }
      .title {
        font-weight: 700;
      }
      .center {
        display: flex;
        justify-content: center;
        padding: 1rem;
      }
      .error {
        color: #b00020;
        padding: 0.5rem 0;
      }
      .hint {
        opacity: 0.7;
      }
    `
  ]
})
export class ProfilePage implements OnInit {
  private username: string | null = null;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly profile = signal<ProfileResponse | null>(null);
  protected readonly followBusy = signal(false);

  // Follower/following totals are not included in ProfileResponse.
  // We derive them using the list endpoints.
  protected readonly followersCount = signal<number | null>(null);
  protected readonly followingCount = signal<number | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly profileApi: ProfileApi,
    private readonly followApi: FollowApi,
    private readonly auth: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username');
    this.load();
  }

  private load(): void {
    const username = this.username;
    if (!username) {
      this.error.set('Missing username');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.profileApi.getByUsername(username).subscribe({
      next: (p) => {
        this.profile.set(p);

        // Load social counts in parallel.
        this.followersCount.set(null);
        this.followingCount.set(null);

        this.followApi.followers(p.user.id).subscribe({
          next: (users) => this.followersCount.set(users.length),
          error: () => this.followersCount.set(null)
        });

        this.followApi.following(p.user.id).subscribe({
          next: (users) => this.followingCount.set(users.length),
          error: () => this.followingCount.set(null)
        });

        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  canFollow(p: ProfileResponse): boolean {
    // Only show follow button if logged in and not viewing yourself.
    if (!this.auth.isAuthenticated()) return false;

    const meUsername = this.auth.getCurrentUsername();
    return meUsername ? meUsername !== p.user.username : true;
  }

  toggleFollow(p: ProfileResponse): void {
    this.followBusy.set(true);

    const req$ = p.isFollowing ? this.followApi.unfollow(p.user.id) : this.followApi.follow(p.user.id);

    req$.subscribe({
      next: (res) => {
        this.profile.set({ ...p, isFollowing: !p.isFollowing });
        this.snackBar.open(res.message ?? 'Updated', 'Dismiss', { duration: 2500 });
        this.followBusy.set(false);
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Follow action failed', 'Dismiss', { duration: 3000 });
        this.followBusy.set(false);
      }
    });
  }

  img(path: string): string {
    return toAbsoluteApiUrl(path);
  }
}
