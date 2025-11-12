import { Component, HostListener } from '@angular/core';
import { ArtworkSummary } from '../artworks/artwork-model';
import { UserProfile } from '../../core/user/user.model';
import { SearchService } from './search.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  query = '';
  users: UserProfile[] = [];
  artworks: ArtworkSummary[] = [];
  loading = false;
  searchMode: 'all' | 'users' | 'artworks' = 'all';  // filter toggle

  constructor(private searchSvc: SearchService) {}

  onSearch(): void {
    if (!this.query.trim()) return;

    this.loading = true;

    if (this.searchMode === 'users') {
      this.searchSvc.searchUsers(this.query).subscribe({
        next: (res) => { this.users = res; this.artworks = []; this.loading = false; },
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else if (this.searchMode === 'artworks') {
      this.searchSvc.searchArtworks({ title: this.query, tags: this.query }).subscribe({
        next: (res) => { this.artworks = res; this.users = []; this.loading = false; },
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.searchSvc.searchAll(this.query).subscribe({
        next: (res) => { this.users = res.users; this.artworks = res.artworks; this.loading = false; },
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }

  @HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.search-bar')) {
    this.users = [];
    this.artworks = [];
  }
}

}
