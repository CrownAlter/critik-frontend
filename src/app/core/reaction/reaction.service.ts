import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArtworkReactions, ReactionType } from './reaction.model';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private base = `${environment.apiUrl}/artworks`;

  constructor(private http: HttpClient) {}

  getReactions(artworkId: number): Observable<ArtworkReactions> {
    return this.http.get<ArtworkReactions>(`${this.base}/${artworkId}/reactions`);
  }

  setReaction(artworkId: number, reaction: ReactionType): Observable<ArtworkReactions> {
  return this.http.post<ArtworkReactions>(
    `${this.base}/${artworkId}/reactions`,
    null, // no body
    { params: { type: reaction } }
  );
}

}
