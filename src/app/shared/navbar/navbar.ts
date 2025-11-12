import { Component, HostListener, ViewChild } from '@angular/core';
import { Auth } from '../../core/auth';
import { AuthDialog } from '../../features/auth-dialog/auth-dialog';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  showAuthDialog = false;
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn = false;
  loggedInUsername: string | null = null;
  dropdownOpen = false;
  @ViewChild('authDialog') authDialog!: AuthDialog;

  constructor(private auth: Auth) {
    // Subscribe to login state changes
    this.auth.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
      // Update the username dynamically when login state changes
      this.loggedInUsername = state ? this.auth.getUsername() : null;
    });
  }

  openPopup(mode: 'login' | 'signup') {
    this.authMode = mode;
    this.showAuthDialog = true;
  }

  closePopup() {
    this.showAuthDialog = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.dropdownOpen = false;
    }
  }
}
