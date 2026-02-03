import type { SafeUser } from "@app/shared-types";

/**
 * Stores the provided authentication token in localStorage under the "auth_token" key.
 *
 * @param auth_token - The authentication token to persist
 */
export function saveToken(auth_token: string): void {
  localStorage.setItem("auth_token", auth_token);
}

export function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch (error) {
    console.error("Failed to get auth_token: ", error);
    return null;
  }
}

/**
 * Remove the "auth_token" entry from localStorage.
 *
 * If removal fails, the error is caught and logged; the function does not throw.
 */
export function removeToken(): void {
  try {
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Failed to remove auth_token: ", error);
  }
}

/**
 * Retrieve the stored SafeUser from localStorage.
 *
 * Reads the `auth_user` key from localStorage and parses it as a `SafeUser`.
 *
 * @returns `SafeUser` if a valid user object is stored under `auth_user`, `null` otherwise.
 */
export function getUser(): SafeUser | null {
  try {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to get auth_user: ", error);
    return null;
  }
}

/**
 * Persists a SafeUser object to localStorage under the "auth_user" key.
 *
 * @param user - The SafeUser to persist
 */
export function saveUser(user: SafeUser): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function removeUser(): void {
  try {
    localStorage.removeItem("auth_user");
  } catch (error) {
    console.error("Failed to remove user: ", error);
  }
}
