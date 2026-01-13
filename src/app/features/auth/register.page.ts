import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiModule],
  template: `
    <div class="auth-page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create account</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" autocomplete="email" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>Must contain uppercase, lowercase, number, and special character.</mat-hint>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Register
            </button>

            <div class="auth-meta">
              <a routerLink="/login">Already have an account?</a>
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
        max-width: 520px;
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
      .hint {
        color: #666;
      }
      .error {
        color: #b00020;
        font-weight: 600;
      }
    `
  ]
})
export class RegisterPage {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);

  // Use NonNullableFormBuilder so `getRawValue()` returns non-null strings.
  readonly form = this.fb.group({
    username: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] })
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

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Account created', 'Dismiss', { duration: 3000 });
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.error?.error ?? 'Registration failed';
        this.error.set(msg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
