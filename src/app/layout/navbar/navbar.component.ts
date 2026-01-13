import { Component, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { AuthDialogComponent } from '../../features/auth/auth.dialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-content">
        <!-- Left Section: Toggle & Brand -->
        <div class="navbar-left">
            <button mat-icon-button (click)="toggleSidebar.emit()" class="toggle-btn">
                <mat-icon>menu</mat-icon>
            </button>
            <a routerLink="/" class="brand">Critik</a>
        </div>

        <!-- Center Section: Search Bar -->
        <div class="navbar-center hidden-mobile-xs">
            <div class="search-bar">
            <mat-icon class="search-icon">search</mat-icon>
                <input 
                type="text" 
                placeholder="Search..." 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="onSearch()"
                />
            </div>
        </div>

        <!-- Right Section: Auth & Profile -->
        <div class="navbar-right">
            <!-- Guest View -->
            <ng-container *ngIf="!isAuthed()">
                <div class="auth-buttons">
                    <button mat-button (click)="openAuth('login')">Login</button>
                    <button mat-raised-button color="primary" (click)="openAuth('register')">Sign Up</button>
                </div>
            </ng-container>

            <!-- Auth View -->
            <ng-container *ngIf="isAuthed()">
                <!-- Mobile Search Trigger (Optional, if we hide main search on small screens) -->
                
                <!-- Profile -->
                <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="profile-btn">
                    <mat-icon>account_circle</mat-icon>
                </button>
                
                <mat-menu #profileMenu="matMenu" xPosition="before">
                    <div class="menu-header" *ngIf="username()">
                        <span class="greeting">Hi, {{ username() }}</span>
                    </div>
                    <mat-divider></mat-divider>
                    <a mat-menu-item [routerLink]="['/users', username()]">
                        <mat-icon>person</mat-icon>
                        <span>Profile</span>
                    </a>
                    <a mat-menu-item routerLink="/me/edit-profile">
                        <mat-icon>settings</mat-icon>
                        <span>Settings</span>
                    </a>
                    <button mat-menu-item (click)="onLogout()">
                        <mat-icon>logout</mat-icon>
                        <span>Logout</span>
                    </button>
                </mat-menu>
            </ng-container>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .navbar {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        padding: 0;
      }

      .navbar-content {
        width: 100%;
        max-width: 100%; /* Full width */
        margin: 0;
        padding: 0 1.5rem; /* Slightly more padding for aesthetics */
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;
      }

      /* Left Section */
      .navbar-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        /* Ensure it takes up space so center can balance, or just fixed width? Flex layout generally handles this OK */
      }

      .brand {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.5rem;
        text-decoration: none;
        color: #111;
        letter-spacing: -0.03em;
        margin-left: 0.25rem;
      }

      /* Center Section */
      .navbar-center {
        flex: 1;
        display: flex;
        justify-content: center;
        padding: 0 1rem;
      }

      .search-bar {
        position: relative;
        display: flex;
        align-items: center;
        background: #f1f3f4;
        border-radius: 999px;
        padding: 0.25rem 1rem;
        width: 100%;
        max-width: 400px; /* Limit width */
        transition: all 0.2s ease;
      }
      .search-bar:focus-within {
        background: #fff;
        box-shadow: 0 0 0 2px #3f51b5;
      }
      .search-icon {
        color: #757575;
        margin-right: 0.5rem;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .search-bar input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 0.9rem;
        width: 100%;
        color: #333;
      }

      /* Right Section */
      .navbar-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .auth-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .profile-btn mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #555;
      }

      .menu-header {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
      }

      /* Responsive */
      @media (max-width: 600px) {
        .brand {
            font-size: 1.25rem;
        }
        .hidden-mobile-xs {
            display: none; /* Hide search bar on very small screens if needed, or adjust */
        }
      }
    `,
  ],
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @Output() toggleSidebar = new EventEmitter<void>();

  readonly username = computed(() => this.auth.username());
  readonly isAuthed = computed(() => this.auth.isAuthenticated());

  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to search page with query param 'q' to populate both user and title
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery },
      });
    }
  }

  openAuth(view: 'login' | 'register') {
    this.dialog.open(AuthDialogComponent, {
      data: { view },
      width: '450px',
      maxWidth: '90vw'
    });
  }

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
      this.router.navigate(['/']);
    });
  }
}
