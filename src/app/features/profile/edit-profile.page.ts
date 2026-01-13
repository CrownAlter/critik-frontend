import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { ProfileApi } from '../../core/api/profile.api';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Edit the current user's profile.
 *
 * Backend: PUT `/users/{id}/edit`
 */
@Component({
  selector: 'app-edit-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Edit Profile</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="!auth.isAuthenticated()" class="hint">Please login first.</div>

        <form *ngIf="auth.isAuthenticated()" [formGroup]="form" (ngSubmit)="onSubmit()" class="grid">
          <mat-form-field appearance="outline" class="wide">
            <mat-label>Display name</mat-label>
            <input matInput formControlName="displayName" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="wide">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="wide">
            <mat-label>Bio</mat-label>
            <input matInput formControlName="bio" />
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="busy() || form.invalid">
              Save
            </button>
            <button mat-button type="button" (click)="goBack()" [disabled]="busy()">Cancel</button>
          </div>

          <div class="error" *ngIf="error()">{{ error() }}</div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 0.75rem;
      }
      .wide {
        width: 100%;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
      }
      .hint {
        opacity: 0.75;
      }
      .error {
        color: #b00020;
      }
    `
  ]
})
export class EditProfilePage {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    displayName: this.fb.control('', { validators: [Validators.maxLength(80)] }),
    email: this.fb.control('', { validators: [Validators.email, Validators.maxLength(120)] }),
    bio: this.fb.control('', { validators: [Validators.maxLength(500)] })
  });

  constructor(
    protected readonly auth: AuthService,
    private readonly profileApi: ProfileApi,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      this.error.set('Missing user id. Please logout and login again.');
      return;
    }

    const v = this.form.getRawValue();

    this.busy.set(true);
    this.error.set(null);

    this.profileApi
      .update(userId, {
        displayName: v.displayName || null,
        email: v.email || null,
        bio: v.bio || null
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Profile updated', 'Dismiss', { duration: 2500 });
          this.busy.set(false);
          this.router.navigate(['/']);
        },
        error: (e) => {
          this.error.set(e?.error?.message ?? 'Failed to update profile');
          this.busy.set(false);
        }
      });
  }
}
