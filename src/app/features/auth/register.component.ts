import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiModule } from '../../shared/ui/ui.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiModule],
    template: `
    <h2 class="auth-title">Join Critik</h2>
    
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
        <mat-hint>Min 8 chars, mixed case & symbols.</mat-hint>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="full-width">
        Sign Up
      </button>

      <div class="auth-meta">
        <button type="button" mat-button color="accent" (click)="onLoginClick.emit()">
            Already have an account? Login
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
        padding: 1.5rem 0;
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
export class RegisterComponent {
    @Output() onSuccess = new EventEmitter<void>();
    @Output() onLoginClick = new EventEmitter<void>();

    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    private readonly fb = inject(NonNullableFormBuilder);
    private readonly auth = inject(AuthService);

    readonly form = this.fb.group({
        username: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
        email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
        password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] })
    });

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.auth.register(this.form.getRawValue()).subscribe({
            next: (res) => {
                // After registration, auto-login or just show success? 
                // Instructions imply flow, usually auto-login is nicer, but we can emit success and let dialog handle
                // For simplicity, we'll try to login immediately or just let the user login.
                // Let's emit success. The dialog can perhaps switch to login or close.
                // Better UX: Auto-login. But let's stick to base first: User creates account, maybe switch to login or notify 'Success, please login'.
                // Actually, let's just emit success and let parent decide.
                this.onSuccess.emit();
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
