import { Component, OnInit } from '@angular/core';
import { ArtworkService } from '../artwork';
import { ArtworkSummary } from '../artwork-model';

@Component({
  selector: 'app-my-artworks',
  standalone: false,
  templateUrl: './my-artworks.html',
  styleUrls: ['./my-artworks.scss']
})
export class MyArtworksComponent implements OnInit {
  artworks: ArtworkSummary[] = [];
  loading = true;

  constructor(private artworkService: ArtworkService) {}

  ngOnInit(): void {
    this.artworkService.getMyArtworks().subscribe({
      next: (data) => {
        console.log('Received artworks:', data);
        this.artworks = Array.isArray(data) ? data : [data]; // ensure array
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching artworks:', err);
        this.loading = false;
      }
    });
  }

  getImageUrl(path: string): string {
    return `http://localhost:8080${path}`;
  }

  // my-artworks.component.ts

isString(value: string | string[] | null | undefined): value is string {
  return typeof value === 'string';
}

asArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

}
