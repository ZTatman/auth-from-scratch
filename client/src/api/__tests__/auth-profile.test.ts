import { beforeEach, describe, expect, it, vi } from "vitest";

import { login, register } from "../auth";
import { deleteAccount, getProfile } from "../profile";

const { apiClientMock } = vi.hoisted(() => ({
  apiClientMock: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../lib/api-client", () => ({
  apiClient: apiClientMock,
}));

describe("auth/profile api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls register endpoint", async () => {
    const expected = { success: true };
    apiClientMock.post.mockResolvedValueOnce(expected);

    const result = await register({
      username: "alice",
      password: "Password1!",
      confirmPassword: "Password1!",
    });

    expect(apiClientMock.post).toHaveBeenCalledWith("/api/register", {
      username: "alice",
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(result).toEqual(expected);
  });

  it("calls login endpoint", async () => {
    const expected = { success: true };
    apiClientMock.post.mockResolvedValueOnce(expected);

    const result = await login({ username: "alice", password: "Password1!" });

    expect(apiClientMock.post).toHaveBeenCalledWith("/api/login", {
      username: "alice",
      password: "Password1!",
    });
    expect(result).toEqual(expected);
  });

  it("calls get profile endpoint with auth", async () => {
    const expected = { success: true };
    apiClientMock.get.mockResolvedValueOnce(expected);

    const result = await getProfile();

    expect(apiClientMock.get).toHaveBeenCalledWith("/api/profile", true);
    expect(result).toEqual(expected);
  });

  it("calls delete profile endpoint with auth", async () => {
    const expected = { success: true };
    apiClientMock.delete.mockResolvedValueOnce(expected);

    const result = await deleteAccount();

    expect(apiClientMock.delete).toHaveBeenCalledWith("/api/profile", true);
    expect(result).toEqual(expected);
  });
});
