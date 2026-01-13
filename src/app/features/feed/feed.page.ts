import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
    <mat-card>
      <mat-card-header>
        <mat-card-title>Feed</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="toggle" *ngIf="isAuthed()">
          <mat-slide-toggle
            [checked]="followingMode()"
            (change)="setFollowingMode($event.checked)"
          >
            Following feed
          </mat-slide-toggle>
        </div>

        <div *ngIf="loading()" class="center">
          <mat-progress-spinner diameter="28"></mat-progress-spinner>
        </div>

        <div *ngIf="error()" class="error">
          {{ error() }}
        </div>

        <div class="grid" *ngIf="!loading()">
          <mat-card class="art" *ngFor="let a of artworks()">
            <img mat-card-image [src]="img(a.imageUrl)" [alt]="a.title" />

            <mat-card-content>
              <div class="title">{{ a.title }}</div>
              <div class="meta">by {{ a.user.username }}</div>
            </mat-card-content>

            <mat-card-actions>
              <a mat-button color="primary" [routerLink]="['/artworks', a.id]">Open</a>
              <a mat-button [routerLink]="['/users', a.user.username]">Profile</a>
            </mat-card-actions>
          </mat-card>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .toggle {
        margin-bottom: 0.75rem;
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
      .meta {
        opacity: 0.75;
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
  ) {}

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
