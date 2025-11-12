import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from './comment.model';

@Injectable({ providedIn: 'root' })

export class CommentService {
  private base = `${environment.apiUrl}/artworks`;

  constructor(private http: HttpClient) {}

  getComments(artworkId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/${artworkId}/comments`);
  }

  postComment(artworkId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.base}/${artworkId}/comments`, { text });
  }
}
