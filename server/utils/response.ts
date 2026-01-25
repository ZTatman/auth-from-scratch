import type { User } from "../generated/prisma/client";

/**
 * Return a SafeUser with sensitive fields removed and `createAt` converted to an ISO 8601 string.
 */
export function toSafeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    createAt: user.createAt.toISOString(),
  };
}
