import { Component, HostListener, ViewChild, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../../features/auth-dialog/auth-dialog';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  showAuthDialog = false;
  authMode: 'login' | 'signup' = 'login'; // <-- New state for mode
  isLoggedIn = false;
  dropdownOpen = false;
  @ViewChild('authDialog') authDialog!: AuthDialog;

  constructor(private auth: Auth) {
    this.auth.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });
  }

   openPopup(mode: 'login' | 'signup') {
    this.authMode = mode;        // set mode first
    this.showAuthDialog = true;   // then open popup
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
