import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UiModule } from '../../shared/ui/ui.module';
import { FollowApi } from '../../core/api/follow.api';
import { User } from '../../core/api/api.models';

/**
 * Following list.
 *
 * Backend: GET `/follow/{userId}/following`
 */
@Component({
  selector: 'app-following-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Following</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <a mat-button *ngIf="backToProfileUsername()" [routerLink]="['/users', backToProfileUsername()]">
          Back to profile
        </a>

        <div *ngIf="loading()" class="center">
          <mat-progress-spinner diameter="28"></mat-progress-spinner>
        </div>

        <div *ngIf="error()" class="error">{{ error() }}</div>

        <mat-list *ngIf="users().length">
          <mat-list-item *ngFor="let u of users()">
            <a mat-button [routerLink]="['/users', u.username]">@{{ u.username }}</a>
          </mat-list-item>
        </mat-list>

        <div *ngIf="!loading() && !users().length" class="hint">No following found.</div>
      </mat-card-content>

    </mat-card>
  `,
  styles: [
    `
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
export class FollowingPage implements OnInit {
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly users = signal<User[]>([]);

  // Username is passed as a query param from the profile page for the back link.
  protected readonly backToProfileUsername = signal<string | null>(null);

  private userId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly followApi: FollowApi
  ) {}

  ngOnInit(): void {
    // Capture username for back link.
    this.backToProfileUsername.set(this.route.snapshot.queryParamMap.get('username'));

    const raw = this.route.snapshot.paramMap.get('userId');
    this.userId = raw ? Number(raw) : null;

    if (!this.userId || Number.isNaN(this.userId)) {
      this.error.set('Invalid user id');
      this.loading.set(false);
      return;
    }

    this.followApi.following(this.userId).subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Failed to load following');
        this.loading.set(false);
      }
    });
  }
}
