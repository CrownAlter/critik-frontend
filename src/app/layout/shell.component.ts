import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UiModule } from '../shared/ui/ui.module';

/**
 * Application shell:
 * - Persistent Navbar
 * - Sidenav (Sidebar)
 * - Router Outlet
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, UiModule],
  template: `
    <app-navbar (toggleSidebar)="sidenav.toggle()"></app-navbar>

    <mat-sidenav-container class="shell-container">
      <mat-sidenav #sidenav mode="side" opened class="app-sidenav">
        <app-sidebar></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .shell-container {
        /* Height calculation: 100vh - navbar height (64px) */
        height: calc(100vh - 64px);
        margin-top: 0; /* Navbar is sticky/fixed, or if sticky handle scroll */
      }
      
      /* Make sure sidebar doesn't overlap navbar if navbar is sticky. 
         Actually, if navbar is sticky, it stays on top. 
         Layout is: 
         - Window
           - Navbar (Fixed/Sticky)
           - SidenavContainer (Below Navbar, takes remaining height)
      */

      .app-sidenav {
        width: 250px;
        border-right: 1px solid rgba(0,0,0,0.08);
      }

      .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
    `
  ]
})
export class ShellComponent { }
