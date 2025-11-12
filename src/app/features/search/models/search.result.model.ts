import { ArtworkSummary } from '../../artworks/artwork-model';
import { UserProfile } from '../../../core/user/user.model';

export interface SearchResults {
  users: UserProfile[];
  artworks: ArtworkSummary[];
}
