// ============================================
// SERVER-ONLY TYPES
// ============================================

// Request bodies
export interface AuthCredentials {
  username: string;
  password: string;
}

// JWT payload (server-only, not sent to client)
export interface JwtPayload {
  userId: string;
  username: string;
}
