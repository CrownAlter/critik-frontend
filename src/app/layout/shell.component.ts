import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../shared/ui/ui.module';
import { AuthApi } from '../core/api/auth.api';
import { AuthService } from '../core/auth/auth.service';

/**
 * Application shell (Angular Material):
 * - `mat-toolbar` top bar
 * - optional `mat-sidenav-container` (ready for future expansion)
 * - router outlet
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, UiModule],
  template: `
    <mat-toolbar color="primary">
      <a class="brand" routerLink="/">Critik</a>

      <span class="spacer"></span>

      <a mat-button routerLink="/search">Search</a>
      <a mat-button routerLink="/upload" *ngIf="isAuthed()">Upload</a>
      <a mat-button routerLink="/my-artworks" *ngIf="isAuthed()">My Artworks</a>
      <a mat-button routerLink="/me/edit-profile" *ngIf="isAuthed()">Edit Profile</a>

      <a mat-button routerLink="/login" *ngIf="!isAuthed()">Login</a>
      <a mat-button routerLink="/register" *ngIf="!isAuthed()">Register</a>

      <button mat-button type="button" *ngIf="isAuthed()" (click)="onLogout()">Logout</button>
      <button mat-button type="button" *ngIf="isAuthed()" (click)="onLogoutAll()">Logout all</button>
    </mat-toolbar>

    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 1rem;
      }
      .brand {
        font-weight: 800;
        text-decoration: none;
        color: inherit;
      }
      .spacer {
        flex: 1;
      }
    `
  ]
})
export class ShellComponent {
  private readonly snackBar = inject(MatSnackBar);

  readonly isAuthed = computed(() => this.auth.isAuthenticated());

  constructor(
    private readonly auth: AuthService,
    private readonly authApi: AuthApi
  ) {}

  onLogout(): void {
    this.auth.logout().subscribe(() => {
      this.snackBar.open('Logged out', 'Dismiss', { duration: 2500 });
    });
  }

  onLogoutAll(): void {
    // Backend invalidates all refresh tokens for this user.
    this.authApi.logoutAll().subscribe({
      next: (res) => {
        // Clear local tokens as well.
        this.auth.logout().subscribe(() => {
          this.snackBar.open(res.message ?? 'Logged out from all devices', 'Dismiss', { duration: 3000 });
        });
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Logout all failed', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
