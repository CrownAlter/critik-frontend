export type ReactionType = 'AGREE' | 'DISAGREE';

export interface ArtworkReactions {
  agree: number;         // count of AGREE reactions
  disagree: number;      // count of DISAGREE reactions
  userReaction?: ReactionType | null; // current logged-in user's reaction
}
