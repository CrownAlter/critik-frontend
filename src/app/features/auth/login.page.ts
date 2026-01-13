import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiModule],
  template: `
    <div class="auth-page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Login
            </button>

            <div class="auth-meta">
              <a routerLink="/register">Create an account</a>
            </div>

            <div *ngIf="error()" class="error">
              {{ error() }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-page {
        max-width: 420px;
        margin: 3rem auto;
        padding: 0 1rem;
      }
      .auth-form {
        display: grid;
        gap: 1rem;
      }
      label {
        display: grid;
        gap: 0.5rem;
        font-weight: 600;
      }
      .auth-meta {
        margin-top: 0.5rem;
      }
      .error {
        color: #b00020;
        font-weight: 600;
      }
    `
  ]
})
export class LoginPage {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);

  // Use NonNullableFormBuilder so `getRawValue()` returns non-null strings.
  readonly form = this.fb.group({
    username: this.fb.control('', { validators: [Validators.required] }),
    password: this.fb.control('', { validators: [Validators.required] })
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Logged in successfully', 'Dismiss', { duration: 2500 });
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        // Backend returns standardized error responses (GlobalExceptionHandler)
        const msg = err?.error?.message ?? 'Login failed';
        this.error.set(msg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
