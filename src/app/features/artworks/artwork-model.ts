export interface UserDto {
  id: number;
  username: string;
  displayName?: string;
  email: string;
  bio?: string | null;
}

export interface ArtworkSummary {
  id: number;
  user: UserDto;
  title?: string | null;
  imageUrl: string;
  locationLat?: number | null;
  locationLon?: number | null;
  locationName?: string | null;
  interpretation?: string;
  tags: string[] | string;
  createdAt?: string;
}

export interface ArtworkUploadPayload {
  file: File;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  interpretation: string;
  tags?: string[];
}
