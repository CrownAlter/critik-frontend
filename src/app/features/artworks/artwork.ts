import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ArtworkSummary, ArtworkUploadPayload } from './artwork-model';

@Injectable({
  providedIn: 'root'
})
export class ArtworkService {
  private base = `${environment.apiUrl}/artworks`;

  constructor(private http: HttpClient) {}

  /** Get all artworks (feed) */
  getMyArtworks(): Observable<ArtworkSummary[]> {
    return this.http.get<ArtworkSummary[]>(`${this.base}/my`);
  }

  getArtworkById(id: number): Observable<ArtworkSummary> {
  return this.http.get<ArtworkSummary>(`${this.base}/${id}`);
}


  getFeed(): Observable<ArtworkSummary[]> {
  return this.http.get<ArtworkSummary[]>(`${this.base}/feed`).pipe(
    map(list => list.map(a => ({
      ...a,
      imageUrl: a.imageUrl.startsWith('http')
        ? a.imageUrl
        : `${environment.apiUrl}${a.imageUrl}`
    })))
  );
}

  /** Upload new artwork */
  uploadArtwork(payload: ArtworkUploadPayload): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.locationName) formData.append('locationName', payload.locationName);
    if (payload.latitude) formData.append('lat', payload.latitude.toString());
    if (payload.longitude) formData.append('lon', payload.longitude.toString());
    formData.append('interpretation', payload.interpretation);
    formData.append('tags', (payload.tags || []).join(','));

    return this.http.post<HttpEvent<any>>(this.base, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
