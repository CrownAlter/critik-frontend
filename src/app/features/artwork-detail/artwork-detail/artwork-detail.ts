import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtworkSummary } from '../../artworks/artwork-model';
import { ArtworkService } from '../../artworks/artwork';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-artwork-detail',
  standalone: false,
  templateUrl: './artwork-detail.html',
  styleUrls: ['./artwork-detail.scss']
})
export class ArtworkDetail implements OnInit {
artworkId!: number;
  artwork?: ArtworkSummary;

  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private artworkService: ArtworkService
  ) {}

  ngOnInit(): void {
    // Extract artworkId from route param
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.artworkId = +id;
        this.loadArtwork();
      } else {
        this.error = 'No artwork specified';
      }
    });
  }

  loadArtwork() {
    this.loading = true;
    this.error = null;

    // Using getFeed or a dedicated getArtwork endpoint
    // Here we simulate fetching a single artwork by ID
    this.artworkService.getFeed()  // If no dedicated getArtwork, filter client-side
      .pipe(
        catchError(err => {
          this.error = 'Failed to load artwork';
          this.loading = false;
          return of([]);
        })
      )
      .subscribe((list: ArtworkSummary[]) => {
        const art = list.find(a => a.id === this.artworkId);
        if (art) {
          this.artwork = art;
        } else {
          this.error = 'Artwork not found';
        }
        this.loading = false;
      });
  }

  // Optional: helper to display tags
  getTags(): string[] {
    if (!this.artwork?.tags) return [];
    if (Array.isArray(this.artwork.tags)) return this.artwork.tags;
    return this.artwork.tags.split(',').map(t => t.trim());
  }

}
