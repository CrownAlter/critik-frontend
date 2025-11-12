import { Component, OnInit } from '@angular/core';
import { ArtworkService } from '../artwork';
import { ArtworkSummary } from '../artwork-model';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.html',
  standalone:false,
  styleUrls: ['./feed.scss']
})
export class FeedComponent implements OnInit {
  artworks: ArtworkSummary[] = [];
  loading = false;
  error: string | null = null;

  constructor(private artwork: ArtworkService) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.loading = true;
    this.artwork.getFeed().subscribe({
      next: (list) => {
        this.artworks = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load artworks';
        this.loading = false;
      }
    });
  }
}
