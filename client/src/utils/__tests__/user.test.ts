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

describe("user storage utilities", () => {
  beforeEach(() => {
    localStorage.clear();
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
