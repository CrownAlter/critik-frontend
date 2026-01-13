import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiModule } from '../../shared/ui/ui.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiModule],
    template: `
    <h2 class="auth-title">Welcome back</h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
      <mat-form-field appearance="outline">
        <mat-label>Username</mat-label>
        <input matInput formControlName="username" autocomplete="username" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput type="password" formControlName="password" autocomplete="current-password" />
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="full-width">
        Login
      </button>

      <div class="auth-meta">
        <button type="button" mat-button color="accent" (click)="onRegisterClick.emit()">
            Don't have an account? Sign up
        </button>
      </div>

      <div *ngIf="error()" class="error">
        {{ error() }}
      </div>
    </form>
  `,
    styles: [
        `
      .auth-title {
        text-align: center;
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-weight: 700;
        font-size: 1.5rem;
      }
      .auth-form {
        display: grid;
        gap: 1rem;
      }
      .full-width {
        width: 100%;
        padding: 1.5rem 0; /* Taller button */
        font-size: 1rem;
      }
      .auth-meta {
        text-align: center;
        margin-top: 0.5rem;
      }
      .error {
        color: #b00020;
        text-align: center;
        font-weight: 500;
      }
    `
    ]
})
export class LoginComponent {
    @Output() onSuccess = new EventEmitter<void>();
    @Output() onRegisterClick = new EventEmitter<void>();

    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    private readonly fb = inject(NonNullableFormBuilder);
    private readonly auth = inject(AuthService);

    readonly form = this.fb.group({
        username: this.fb.control('', { validators: [Validators.required] }),
        password: this.fb.control('', { validators: [Validators.required] })
    });

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.auth.login(this.form.getRawValue()).subscribe({
            next: () => {
                this.onSuccess.emit();
            },
            error: (err) => {
                const msg = err?.error?.message ?? 'Login failed';
                this.error.set(msg);
                this.loading.set(false);
            },
            complete: () => this.loading.set(false)
        });
    }
}
