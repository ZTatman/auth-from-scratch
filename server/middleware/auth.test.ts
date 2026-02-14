import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  authenticateToken,
  type AuthenticatedRequest,
} from "./auth";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

const mockedJwt = jwt as unknown as {
  verify: (token: string, secret: string, callback: (err: Error | null, decoded?: unknown) => void) => void;
};

function createResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

describe("authenticateToken", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    mockedJwt.verify = vi.fn();
  });

  it("returns 401 when the auth token is missing", () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Access token required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 500 when the JWT secret is missing", () => {
    process.env.JWT_SECRET = "";
    const req = { headers: { authorization: "Bearer token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server configuration error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 for invalid tokens", () => {
    mockedJwt.verify = vi.fn((_token, _secret, callback) => {
      callback(new Error("invalid token"));
    });

    const req = { headers: { authorization: "Bearer token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for expired tokens", () => {
    mockedJwt.verify = vi.fn((_token, _secret, callback) => {
      const error = new Error("jwt expired") as Error & {
        name: string;
        expiredAt: string;
      };
      error.name = "TokenExpiredError";
      error.expiredAt = new Date("2024-01-01T00:00:00.000Z").toISOString();
      callback(error);
    });

    const req = { headers: { authorization: "Bearer token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 for tokens with invalid payload shape", () => {
    mockedJwt.verify = vi.fn((_token, _secret, callback) => {
      callback(null, { userId: 1, username: "codex" });
    });

    const req = { headers: { authorization: "Bearer token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token payload",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches decoded payload and calls next for valid tokens", () => {
    mockedJwt.verify = vi.fn((_token, _secret, callback) => {
      callback(null, { userId: "user-1", username: "codex" });
    });

    const req = { headers: { authorization: "Bearer token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    authenticateToken(req, res, next);

    expect(req.user).toEqual({ userId: "user-1", username: "codex" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
    vi.restoreAllMocks();
  });
});
