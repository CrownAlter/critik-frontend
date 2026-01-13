import { Component, computed, inject } from '@angular/core';
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
        <!-- Brand -->
        <a routerLink="/" class="brand">Critik</a>

        <!-- Search Bar (Always Visible) -->
        <div class="search-bar">
          <mat-icon class="search-icon">search</mat-icon>
            <input 
              type="text" 
              placeholder="Search users or artworks..." 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="onSearch()"
            />
        </div>

        <span class="spacer"></span>

        <!-- Guest View -->
        <ng-container *ngIf="!isAuthed()">
          <div class="auth-buttons">
            <button mat-button (click)="openAuth('login')">Login</button>
            <button mat-raised-button color="primary" (click)="openAuth('register')">Sign Up</button>
            
            <!-- Guest Menu (About, Blog, Contact) -->
            <button mat-icon-button [matMenuTriggerFor]="guestMenu" class="menu-btn">
               <mat-icon>menu</mat-icon>
            </button>
            <mat-menu #guestMenu="matMenu" xPosition="before">
                <a mat-menu-item routerLink="/" fragment="about">About</a>
                <a mat-menu-item routerLink="/" fragment="blog">Blog</a>
                <a mat-menu-item routerLink="/" fragment="contact">Contact</a>
            </mat-menu>
          </div>
        </ng-container>

        <!-- Auth View -->
        <ng-container *ngIf="isAuthed()">
          <!-- Profile -->
          <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="profile-btn">
             <!-- If we had an avatar URL, we'd use it here. For now, a clean icon. -->
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
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        padding: 0;
      }

      .navbar-content {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        height: 64px;
        gap: 1rem;
      }

      .brand {
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.5rem;
        text-decoration: none;
        color: #111;
        letter-spacing: -0.03em;
        transition: opacity 0.2s;
        margin-right: 1rem;
      }

      .spacer {
        flex: 1;
      }

      .auth-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: 1rem;
      }

      .menu-btn {
        margin-left: 0.5rem;
        color: #555;
      }

      .auth-buttons {
        display: flex;
        gap: 0.5rem;
        margin-left: 1rem;
      }

      /* Search Bar Styling */
      .search-bar {
        position: relative;
        display: flex;
        align-items: center;
        background: #f1f3f4;
        border-radius: 999px;
        padding: 0.25rem 1rem;
        width: 300px;
        transition: all 0.2s ease;
      }
      .search-bar:focus-within {
        background: #fff;
        box-shadow: 0 0 0 2px #3f51b5; /* Primary color ring */
        width: 320px;
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

      /* Mobile Helper */
      @media (max-width: 768px) {
        .hidden-mobile {
          display: none;
        }
        .search-bar {
            width: 150px;
        }
        .search-bar:focus-within {
            width: 200px;
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
