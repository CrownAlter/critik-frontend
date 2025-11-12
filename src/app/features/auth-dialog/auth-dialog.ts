import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-dialog',
  standalone: false,
  templateUrl: './auth-dialog.html',
  styleUrls: ['./auth-dialog.scss']
})
export class AuthDialog {
  @Input() visible = false;                  // Controls popup visibility
  @Input() mode: 'login' | 'signup' = 'login'; // Mode passed from navbar
  @Output() close = new EventEmitter<void>(); // Emits close event to navbar

  loading = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  loginError: string | null = null;
  registerError: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get isLoginMode(): boolean {
    return this.mode === 'login';
  }

  switchMode() {
    this.mode = this.isLoginMode ? 'signup' : 'login';
    this.loginError = null;
    this.registerError = null;
    this.success = null;
  }

  closeDialog(event?: Event) {
    if (event) event.stopPropagation();
    this.close.emit();
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.loginError = null;

    this.auth.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.closeDialog();
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        this.loginError =
          err?.error?.message ||
          'Login failed. Please check your credentials.';
      }
    });
  }

  onSignup() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.registerError = null;

    this.auth.register(this.registerForm.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created successfully! You can now log in.';
        this.mode = 'login'; // Switch back to login mode after signup
      },
      error: (err) => {
        this.loading = false;
        this.registerError =
          err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
