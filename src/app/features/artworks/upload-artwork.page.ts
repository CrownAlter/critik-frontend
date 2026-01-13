import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { ArtworksApi } from '../../core/api/artworks.api';

/**
 * Upload an artwork.
 *
 * Backend: POST `/artworks` (multipart/form-data)
 */
@Component({
  selector: 'app-upload-artwork-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Upload artwork</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid">
          <div class="file-row">
            <button mat-stroked-button type="button" (click)="fileInput.click()">Choose image</button>
            <span class="hint" *ngIf="!selectedFile()">No file selected</span>
            <span class="hint" *ngIf="selectedFile() as f">{{ f.name }}</span>
            <input #fileInput type="file" accept="image/*" (change)="onFile($event)" hidden />
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Artist name</mat-label>
            <input matInput formControlName="artistName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Location name</mat-label>
            <input matInput formControlName="locationName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Latitude</mat-label>
            <input matInput type="number" formControlName="lat" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Longitude</mat-label>
            <input matInput type="number" formControlName="lon" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="wide">
            <mat-label>Interpretation</mat-label>
            <input matInput formControlName="interpretation" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="wide">
            <mat-label>Tags</mat-label>
            <input matInput formControlName="tags" placeholder="comma-separated" />
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="busy() || form.invalid || !selectedFile()">
              Upload
            </button>
            <button mat-button type="button" (click)="onReset()" [disabled]="busy()">Reset</button>
          </div>

          <div class="error" *ngIf="error()">{{ error() }}</div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        align-items: end;
      }
      .file-row {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 0.5rem;
      }
      .wide {
        grid-column: 1 / -1;
      }
      .hint {
        opacity: 0.75;
      }
      .error {
        grid-column: 1 / -1;
        color: #b00020;
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class UploadArtworkPage {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);

  protected readonly form = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.minLength(1)] }),
    artistName: this.fb.control(''),
    locationName: this.fb.control(''),
    lat: this.fb.control<number | null>(null),
    lon: this.fb.control<number | null>(null),
    interpretation: this.fb.control(''),
    tags: this.fb.control('')
  });

  constructor(
    private readonly artworksApi: ArtworksApi,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    // Minimal validation: ensure it is an image.
    if (file && !file.type.startsWith('image/')) {
      this.snackBar.open('Please choose an image file', 'Dismiss', { duration: 3000 });
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
  }

  onReset(): void {
    this.form.reset({
      title: '',
      artistName: '',
      locationName: '',
      lat: null,
      lon: null,
      interpretation: '',
      tags: ''
    });
    this.selectedFile.set(null);
    this.error.set(null);
  }

  onSubmit(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Please choose an image file.');
      return;
    }

    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    this.busy.set(true);
    this.error.set(null);

    this.artworksApi
      .upload({
        file,
        title: v.title,
        artistName: v.artistName || undefined,
        locationName: v.locationName || undefined,
        lat: v.lat ?? undefined,
        lon: v.lon ?? undefined,
        interpretation: v.interpretation || undefined,
        tags: v.tags || undefined
      })
      .subscribe({
        next: (created) => {
          this.snackBar.open('Artwork uploaded', 'Dismiss', { duration: 2500 });
          this.busy.set(false);
          // Navigate to the newly created artwork detail.
          this.router.navigate(['/artworks', created.id]);
        },
        error: (e) => {
          this.error.set(e?.error?.message ?? 'Upload failed');
          this.busy.set(false);
        }
      });
  }
}
