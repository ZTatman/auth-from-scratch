import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_STORAGE_EVENT,
  getToken,
  getUser,
  removeToken,
  removeUser,
  saveToken,
  saveUser,
} from "../user";

function installLocalStorageMock(): void {
  const store = new Map<string, string>();
  const localStorageMock: Pick<
    Storage,
    "getItem" | "setItem" | "removeItem" | "clear"
  > = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    configurable: true,
  });
}

describe("user storage utilities", () => {
  beforeEach(() => {
    installLocalStorageMock();
    // Intentional: verify remove helpers remain safe/idempotent on empty storage.
    removeToken();
    removeUser();
  });

  it("saves and retrieves auth tokens with storage events", () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_STORAGE_EVENT, listener);

    saveToken("jwt-123");

    expect(getToken()).toBe("jwt-123");
    expect(listener).toHaveBeenCalledTimes(1);

    removeToken();

    expect(getToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);

    window.removeEventListener(AUTH_STORAGE_EVENT, listener);
  });

  it("saves and retrieves auth users safely", () => {
    const user = {
      id: "user-1",
      username: "codex",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    saveUser(user);

    expect(getUser()).toEqual(user);

    removeUser();

    expect(getUser()).toBeNull();
  });
});
