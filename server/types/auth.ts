// ============================================
// SERVER-ONLY TYPES
// ============================================

// Request bodies
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// JWT payload (server-only, not sent to client)
export interface JwtPayload {
  userId: string;
  username: string;
}
