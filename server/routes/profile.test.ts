import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedRequest } from "../middleware/auth";

const { userRepositoryMock } = vi.hoisted(() => ({
  userRepositoryMock: {
    findByUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../db/repositories/userRepository", () => ({
  userRepository: userRepositoryMock,
}));

import { deleteProfileHandler, getProfileHandler } from "./profile";

type MockResponse<T> = Response<T> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

function createMockResponse<T>(): MockResponse<T> {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  return response as unknown as MockResponse<T>;
}

describe("profile route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when profile request has no authenticated user", async () => {
    const req = {} as AuthenticatedRequest;
    const res = createMockResponse();

    await getProfileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User ID not found in token",
    });
  });

  it("returns 404 when authenticated user no longer exists", async () => {
    userRepositoryMock.findById.mockResolvedValueOnce(null);

    const req = {
      user: { userId: "user-1", username: "alice" },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await getProfileHandler(req, res);

    expect(userRepositoryMock.findById).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("returns 200 with safe profile data", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    userRepositoryMock.findById.mockResolvedValueOnce({
      id: "user-1",
      username: "alice",
      password: "hashed",
      createdAt,
    });

    const req = {
      user: { userId: "user-1", username: "alice" },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await getProfileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: "user-1",
        username: "alice",
        createdAt: createdAt.toISOString(),
      },
    });
  });

  it("returns 500 when profile lookup throws unexpectedly", async () => {
    userRepositoryMock.findById.mockRejectedValueOnce(new Error("db down"));

    const req = {
      user: { userId: "user-1", username: "alice" },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await getProfileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An error occurred while retrieving your profile",
    });
  });

  it("returns 401 when account deletion has no authenticated user", async () => {
    const req = {} as AuthenticatedRequest;
    const res = createMockResponse();

    await deleteProfileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User ID not found in token",
    });
  });

  it("returns 200 after account deletion", async () => {
    userRepositoryMock.delete.mockResolvedValueOnce({ id: "user-1" });

    const req = {
      user: { userId: "user-1", username: "alice" },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await deleteProfileHandler(req, res);

    expect(userRepositoryMock.delete).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Account deleted successfully",
      data: { userId: "user-1" },
    });
  });

  it("returns 500 when account deletion throws unexpectedly", async () => {
    userRepositoryMock.delete.mockRejectedValueOnce(new Error("db down"));

    const req = {
      user: { userId: "user-1", username: "alice" },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await deleteProfileHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An error occurred while deleting your account",
    });
  });
});
