export interface CommentUser {
  username: string;
  displayName?: string;
}

export interface Comment {
  id: number;
  user: CommentUser;
  commentText: string;
  createdAt: string;
}
