import type { SafeUser } from "@app/shared-types";

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

export function removeToken(): void {
  try {
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Failed to get auth_token: ", error);
  }
}

export function getUser(): SafeUser | null {
  try {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to get auth_user: ", error);
    return null;
  }
}

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
