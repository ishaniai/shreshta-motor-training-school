/** Logged-in user (no password) */
export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  trainingInterest?: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}
