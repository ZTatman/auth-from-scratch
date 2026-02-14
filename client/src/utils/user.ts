import type { SafeUser } from "@app/shared-types";

export const AUTH_STORAGE_EVENT = "auth-storage";

/**
 * Safely resolve browser localStorage. Returns null when unavailable or partially mocked.
 */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;

  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) {
    return null;
  }

  return storage;
}

function notifyAuthStorage(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

/**
 * Stores the provided authentication token in localStorage under the "auth_token" key.
 *
 * @param auth_token - The authentication token to persist
 */
export function saveToken(auth_token: string): void {
  try {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem("auth_token", auth_token);
    notifyAuthStorage();
  } catch (error) {
    console.error("Failed to save auth_token: ", error);
  }
}

export function getToken(): string | null {
  try {
    const storage = getStorage();
    if (!storage) return null;

    return storage.getItem("auth_token");
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
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem("auth_token");
    notifyAuthStorage();
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
    const storage = getStorage();
    if (!storage) return null;

    const stored = storage.getItem("auth_user");
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
  try {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem("auth_user", JSON.stringify(user));
    notifyAuthStorage();
  } catch (error) {
    console.error("Failed to save auth_user: ", error);
  }
}

export function removeUser(): void {
  try {
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem("auth_user");
    notifyAuthStorage();
  } catch (error) {
    console.error("Failed to remove user: ", error);
  }
}
