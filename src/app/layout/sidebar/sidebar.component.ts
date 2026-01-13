import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiModule } from '../../shared/ui/ui.module';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, UiModule],
    template: `
    <div class="sidebar-content">
      <mat-nav-list>
        
        <h3 mat-subheader>Resources</h3>
        
        <a mat-list-item routerLink="/" fragment="about">
          <mat-icon matListItemIcon>info</mat-icon>
          <span matListItemTitle>About</span>
        </a>

        <a mat-list-item routerLink="/" fragment="blog">
          <mat-icon matListItemIcon>article</mat-icon>
          <span matListItemTitle>Blog</span>
        </a>

        <a mat-list-item routerLink="/" fragment="contact">
          <mat-icon matListItemIcon>contact_support</mat-icon>
          <span matListItemTitle>Contact Us</span>
        </a>

        <mat-divider></mat-divider>

        <h3 mat-subheader>Feeds</h3>
        <a mat-list-item routerLink="/">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
        </a>
        <a mat-list-item routerLink="/search">
            <mat-icon matListItemIcon>search</mat-icon>
            <span matListItemTitle>Discover</span>
        </a>

      </mat-nav-list>
    </div>
  `,
    styles: [`
    .sidebar-content {
      width: 250px;
      padding-top: 1rem;
    }
  `]
})
export class SidebarComponent { }
