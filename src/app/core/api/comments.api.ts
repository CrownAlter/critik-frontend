import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Comment } from './api.models';

/**
 * API client for comment endpoints.
 * Manage comments and replies on artworks.
 *
 * Backend controller: `CommentController`.
 */
@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) { }

  /**
   * Lists all comments for a specific artwork.
   * @param artworkId The ID of the artwork.
   * @returns An observable containing an array of comments.
   */
  list(artworkId: number) {
    return this.http.get<Comment[]>(`${this.baseUrl}/artworks/${artworkId}/comments`);
  }

  /**
   * Adds a new comment to an artwork.
   * @param artworkId The ID of the artwork.
   * @param text The content of the comment.
   * @returns An observable containing the created comment.
   */
  add(artworkId: number, text: string) {
    return this.http.post<Comment>(`${this.baseUrl}/artworks/${artworkId}/comments`, { text });
  }

  /**
   * Replies to an existing comment.
   * @param artworkId The ID of the artwork.
   * @param commentId The ID of the parent comment.
   * @param text The content of the reply.
   * @returns An observable containing the created reply.
   */
  reply(artworkId: number, commentId: number, text: string) {
    return this.http.post<Comment>(
      `${this.baseUrl}/artworks/${artworkId}/comments/${commentId}/replies`,
      { text }
    );
  }

  /**
   * Deletes a comment or reply.
   * @param artworkId The ID of the artwork.
   * @param commentId The ID of the comment to delete.
   * @returns An observable with the server response.
   */
  delete(artworkId: number, commentId: number) {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/artworks/${artworkId}/comments/${commentId}`
    );
  }
}
