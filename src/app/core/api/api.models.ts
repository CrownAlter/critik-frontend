/**
 * Shared API models that mirror the backend entities/DTOs.
 *
 * Backend source:
 * - `critik-backend/src/main/java/com/application/critik/entities/*`
 * - `critik-backend/src/main/java/com/application/critik/dto/*`
 */

export interface User {
  id: number;
  username: string;
  displayName?: string | null;
  email?: string | null;
  bio?: string | null;
}

export interface Artwork {
  id: number;
  user: User;
  title: string;
  artistName?: string | null;
  imageUrl: string; // e.g. "/uploads/<filename>"
  locationLat?: number | null;
  locationLon?: number | null;
  locationName?: string | null;
  interpretation?: string | null;
  tags?: string | null; // comma-separated in entity
  createdAt?: string; // ISO string from backend
  updatedAt?: string;
}

export interface Comment {
  id: number;
  user: User;
  commentText: string;
  createdAt?: string;
  // `parentComment` is present for replies. Backend uses @JsonIgnoreProperties to avoid loops.
  parentComment?: Comment | null;
  replies: Comment[];
}

export type ReactionType = 'AGREE' | 'DISAGREE';

export type ReactionCounts = Partial<Record<ReactionType, number>>;

export interface UserReactionResponse {
  hasReaction: boolean;
  type: ReactionType | null;
}

export interface ProfileResponse {
  user: User;
  artworks: Artwork[];
  isFollowing: boolean;
}
