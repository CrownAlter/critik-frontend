import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';

/**
 * Application shell:
 * - Persistent Navbar
 * - Router Outlet
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .container {
        /* max-width: 1100px;  Allow full width or manage max-width in sub-pages if needed, 
           but for now keeping consistent with previous shell but maybe flexible height */
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
        min-height: calc(100vh - 64px); /* Ensure footer (if added) pushes down */
      }
    `
  ]
})
export class ShellComponent { }
