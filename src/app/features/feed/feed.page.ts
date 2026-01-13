import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// Material Imports handled often in UiModule but explicitly good for clarity or if missing
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiModule } from '../../shared/ui/ui.module';
import { ArtworksApi } from '../../core/api/artworks.api';
import { Artwork } from '../../core/api/api.models';
import { toAbsoluteApiUrl } from '../../core/api/api.util';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Public feed.
 *
 * Backend: GET `/artworks/feed`
 */
@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UiModule],
  template: `
    <div class="feed-container">
      <div class="header">
        <h1>Feed</h1>
        
        <div class="toggle" *ngIf="isAuthed()">
          <mat-slide-toggle
            [checked]="followingMode()"
            (change)="setFollowingMode($event.checked)"
          >
            Following
          </mat-slide-toggle>
        </div>
      </div>

      <div *ngIf="loading()" class="center">
        <mat-progress-spinner diameter="40"></mat-progress-spinner>
      </div>

      <div *ngIf="error()" class="error">
        {{ error() }}
      </div>

      <div class="feed-list" *ngIf="!loading()">
        <!-- Horizontal Card -->
        <mat-card class="feed-card" *ngFor="let a of artworks()">
          <!-- Left: Image -->
          <div class="card-image-section">
            <img [src]="img(a.imageUrl)" [alt]="a.title" />
          </div>

          <!-- Right: Details -->
          <div class="card-details-section">
            <!-- Header: User & Title -->
            <div class="card-header">
              <div mat-card-avatar class="user-avatar-placeholder">
                <mat-icon>person</mat-icon>
              </div>
              <div class="header-text">
                <a [routerLink]="['/users', a.user.username]" class="username-link">{{ a.user.username }}</a>
                <div class="location-name">{{ a.locationName || 'Unknown Location' }}</div>
              </div>
            </div>

            <div class="artwork-info">
              <h2 class="artwork-title">{{ a.title }}</h2>
              <p class="caption-text" *ngIf="a.tags">{{ a.tags }}</p>
            </div>

            <div class="likes-count">0 likes</div>

            <div class="actions">
              <div class="icon-actions">
                <button mat-icon-button>
                  <mat-icon>favorite_border</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>chat_bubble_outline</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>share</mat-icon>
                </button>
              </div>
              <button mat-raised-button color="primary" [routerLink]="['/artworks', a.id]">
                Details
              </button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .feed-container {
        max-width: 900px; /* Wider to accommodate horizontal layout */
        margin: 0 auto;
        padding: 0 1rem 4rem 1rem; /* Top/Right/Bottom/Left padding */
      }
      
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      .header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #111;
      }

      .feed-list {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .feed-card {
        display: flex;
        flex-direction: row;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        height: 350px; /* Fixed height for consistency */
        background: #fff;
      }

      /* Left Side: Image */
      .card-image-section {
        flex: 1.5; /* Takes up more space */
        overflow: hidden;
        background-color: #f5f5f5;
        position: relative;
      }

      .card-image-section img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }
      
      /* Subtle zoom effect on hover */
      .feed-card:hover .card-image-section img {
        transform: scale(1.02);
      }

      /* Right Side: Details */
      .card-details-section {
        flex: 1; /* Takes up less space than image */
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .user-avatar-placeholder {
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .header-text {
        display: flex;
        flex-direction: column;
      }

      .username-link {
        text-decoration: none;
        color: #222;
        font-weight: 700;
        font-size: 1rem;
      }
      .username-link:hover {
        text-decoration: underline;
      }

      .location-name {
        font-size: 0.85rem;
        color: #666;
      }

      .artwork-info {
        flex-grow: 1;
      }

      .artwork-title {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
      }

      .caption-text {
        color: #00376b;
        font-size: 0.9rem;
        margin: 0;
      }

      .likes-count {
        font-weight: 600;
        margin-bottom: 1rem;
        font-size: 0.95rem;
      }

      .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .icon-actions {
        display: flex;
        gap: 0.25rem;
        margin-left: -8px; /* Offset material button padding */
      }

      /* Responsive for mobile: Stack them */
      @media (max-width: 768px) {
        .feed-card {
          flex-direction: column;
          height: auto;
        }
        .card-image-section {
            height: 300px;
            flex: none;
        }
        .card-details-section {
            flex: none;
            padding: 1rem;
        }
      }

      .center {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      .error {
        text-align: center;
        color: #b00020;
        padding: 1rem;
      }
    `
  ]
})
export class FeedPage implements OnInit {
  protected readonly artworks = signal<Artwork[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly followingMode = signal(false);
  protected readonly isAuthed = computed(() => this.auth.isAuthenticated());

  constructor(
    private readonly artworksApi: ArtworksApi,
    private readonly auth: AuthService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  setFollowingMode(enabled: boolean): void {
    this.followingMode.set(enabled);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    if (this.followingMode()) {
      const userId = this.auth.getCurrentUserId();
      if (!userId) {
        this.error.set('Missing user id. Please logout and login again.');
        this.loading.set(false);
        return;
      }

      this.artworksApi.getFeedForUser(userId).subscribe({
        next: (items) => {
          this.artworks.set(items);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e?.error?.message ?? 'Failed to load following feed');
          this.loading.set(false);
        }
      });
      return;
    }

    this.artworksApi.getFeed().subscribe({
      next: (items) => {
        this.artworks.set(items);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Failed to load feed');
        this.loading.set(false);
      }
    });
  }

  img(path: string): string {
    return toAbsoluteApiUrl(path);
  }
}
