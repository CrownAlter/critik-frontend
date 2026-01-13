import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';

export type AuthView = 'login' | 'register';

@Component({
    selector: 'app-auth-dialog',
    standalone: true,
    imports: [CommonModule, LoginComponent, RegisterComponent],
    template: `
    <div class="dialog-content">
        <ng-container [ngSwitch]="view()">
            <app-login 
                *ngSwitchCase="'login'" 
                (onSuccess)="onLoginSuccess()" 
                (onRegisterClick)="view.set('register')"
            ></app-login>
            
            <app-register 
                *ngSwitchCase="'register'" 
                (onSuccess)="onRegisterSuccess()" 
                (onLoginClick)="view.set('login')"
            ></app-register>
        </ng-container>
    </div>
  `,
    styles: [`
    .dialog-content {
        padding: 2rem;
        min-width: 320px;
    }
  `]
})
export class AuthDialogComponent {
    readonly view = signal<AuthView>('login');

    constructor(
        private readonly dialogRef: MatDialogRef<AuthDialogComponent>,
        private readonly snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: { view: AuthView }
    ) {
        if (data?.view) {
            this.view.set(data.view);
        }
    }

    onLoginSuccess() {
        this.snackBar.open('Logged in successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
    }

    onRegisterSuccess() {
        this.snackBar.open('Account created! Please log in.', 'Close', { duration: 5000 });
        this.view.set('login');
    }
}
