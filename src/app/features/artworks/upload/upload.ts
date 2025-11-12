import { Component } from '@angular/core';
import { ArtworkService } from '../artwork';
import { ArtworkUploadPayload } from '../artwork-model';

@Component({
  selector: 'app-upload',
    standalone:false,
  templateUrl: './upload.html',
  styleUrls: ['./upload.scss']
})
export class UploadComponent {
  file: File | null = null;
  interpretation = '';
  locationName = '';
  tags = '';
  uploading = false;

  constructor(private artworkService: ArtworkService) {}

  onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  upload(): void {
    if (!this.file || !this.interpretation) return;

    const payload: ArtworkUploadPayload = {
      file: this.file,
      interpretation: this.interpretation,
      locationName: this.locationName,
      tags: this.tags.split(',').map(t => t.trim())
    };

    this.uploading = true;
    this.artworkService.uploadArtwork(payload).subscribe({
      next: () => {
        alert('Upload successful!');
        this.uploading = false;
      },
      error: () => {
        alert('Upload failed.');
        this.uploading = false;
      }
    });
  }
}
