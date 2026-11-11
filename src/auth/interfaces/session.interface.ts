export interface User {
  id: number;
  name: string;
  email: string;
}

export interface SessionRecord {
  token: string;
  user: User;
  createdAt: Date;
  expiresAt: Date;
}
