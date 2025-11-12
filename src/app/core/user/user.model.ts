export interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  bio?: string;
  isFollowing?: boolean | null; // optional, useful when showing another user's profile
}
