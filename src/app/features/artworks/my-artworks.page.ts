import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UiModule } from '../../shared/ui/ui.module';
import { ArtworksApi } from '../../core/api/artworks.api';
import { Artwork } from '../../core/api/api.models';
import { toAbsoluteApiUrl } from '../../core/api/api.util';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Displays the current authenticated user's uploaded artworks.
 *
 * Backend: GET `/artworks/my`
 */
@Component({
  selector: 'app-my-artworks-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>My Artworks</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="!isAuthed()" class="hint">Please login to view your artworks.</div>

        <div *ngIf="isAuthed()">
          <div *ngIf="loading()" class="center">
            <mat-progress-spinner diameter="28"></mat-progress-spinner>
          </div>

          <div *ngIf="error()" class="error">{{ error() }}</div>

          <div class="grid" *ngIf="!loading() && artworks().length">
            <mat-card class="art" *ngFor="let a of artworks()">
              <img mat-card-image [src]="img(a.imageUrl)" [alt]="a.title" />
              <mat-card-content>
                <div class="title">{{ a.title }}</div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/artworks', a.id]">Open</a>
              </mat-card-actions>
            </mat-card>
          </div>

          <div *ngIf="!loading() && !artworks().length" class="hint">No uploads yet.</div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
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
        opacity: 0.75;
      }
    `
  ]
})
export class MyArtworksPage implements OnInit {
  protected readonly isAuthed = computed(() => this.auth.isAuthenticated());

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly artworks = signal<Artwork[]>([]);

  constructor(
    private readonly artworksApi: ArtworksApi,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.artworksApi.getMyArtworks().subscribe({
      next: (items) => {
        this.artworks.set(items);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Failed to load your artworks');
        this.loading.set(false);
      }
    });
  }

  img(path: string): string {
    return toAbsoluteApiUrl(path);
  }
}
