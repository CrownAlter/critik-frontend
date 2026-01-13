import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UiModule } from '../../shared/ui/ui.module';
import { SearchApi } from '../../core/api/search.api';
import { Artwork, User } from '../../core/api/api.models';
import { toAbsoluteApiUrl } from '../../core/api/api.util';

/**
 * Search across users and artworks.
 *
 * Backend:
 * - GET `/search/users?q=`
 * - GET `/search/artworks?title=&location=&tags=`
 */
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Search</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form class="grid" [formGroup]="form" (ngSubmit)="onSearch()">
          <mat-form-field appearance="outline">
            <mat-label>User query</mat-label>
            <input matInput formControlName="userQuery" placeholder="Search users by username" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Artwork title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tags</mat-label>
            <input matInput formControlName="tags" placeholder="comma-separated" />
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
              Search
            </button>
            <button mat-button type="button" (click)="onClear()" [disabled]="loading()">Clear</button>
          </div>
        </form>

        <div *ngIf="loading()" class="center">
          <mat-progress-spinner diameter="28"></mat-progress-spinner>
        </div>

        <div *ngIf="error()" class="error">{{ error() }}</div>

        <section *ngIf="users().length">
          <h3>Users</h3>
          <mat-list>
            <mat-list-item *ngFor="let u of users()">
              <a mat-button [routerLink]="['/users', u.username]">@{{ u.username }}</a>
            </mat-list-item>
          </mat-list>
        </section>

        <section *ngIf="artworks().length">
          <h3>Artworks</h3>
          <div class="art-grid">
            <mat-card class="art" *ngFor="let a of artworks()">
              <img mat-card-image [src]="img(a.imageUrl)" [alt]="a.title" />
              <mat-card-content>
                <div class="title">{{ a.title }}</div>
                <div class="meta">by {{ a.user.username }}</div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/artworks', a.id]">Open</a>
              </mat-card-actions>
            </mat-card>
          </div>
        </section>

        <div *ngIf="!loading() && !users().length && !artworks().length" class="hint">
          Use the fields above and click Search.
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        align-items: end;
      }
      .actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 0.5rem;
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
        padding-top: 0.75rem;
      }
      .art-grid {
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
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SearchPage {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly users = signal<User[]>([]);
  protected readonly artworks = signal<Artwork[]>([]);

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    userQuery: this.fb.control(''),
    title: this.fb.control(''),
    location: this.fb.control(''),
    tags: this.fb.control('')
  });

  constructor(private readonly searchApi: SearchApi) {}

  onClear(): void {
    this.form.reset({ userQuery: '', title: '', location: '', tags: '' });
    this.users.set([]);
    this.artworks.set([]);
    this.error.set(null);
  }

  onSearch(): void {
    const v = this.form.getRawValue();

    this.loading.set(true);
    this.error.set(null);
    this.users.set([]);
    this.artworks.set([]);

    const userQ = v.userQuery.trim();
    const hasArtworkFilters = Boolean(v.title.trim() || v.location.trim() || v.tags.trim());

    const user$ = userQ ? this.searchApi.users(userQ) : null;
    const artworks$ = hasArtworkFilters
      ? this.searchApi.artworks({
          title: v.title.trim() || undefined,
          location: v.location.trim() || undefined,
          tags: v.tags.trim() || undefined
        })
      : null;

    // Fire both requests (if needed) and collect results.
    let pending = 0;
    const done = () => {
      pending--;
      if (pending <= 0) this.loading.set(false);
    };

    if (user$) {
      pending++;
      user$.subscribe({
        next: (res) => {
          this.users.set(res);
          done();
        },
        error: (e) => {
          this.error.set(e?.error?.message ?? 'User search failed');
          done();
        }
      });
    }

    if (artworks$) {
      pending++;
      artworks$.subscribe({
        next: (res) => {
          this.artworks.set(res);
          done();
        },
        error: (e) => {
          this.error.set(e?.error?.message ?? 'Artwork search failed');
          done();
        }
      });
    }

    if (pending === 0) {
      this.loading.set(false);
    }
  }

  img(path: string): string {
    return toAbsoluteApiUrl(path);
  }
}
