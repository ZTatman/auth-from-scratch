import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("auth route handlers", () => {
  const originalSecret = process.env.JWT_SECRET;
  let registerHandler: typeof import("./auth").registerHandler;
  let loginHandler: typeof import("./auth").loginHandler;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    ({ registerHandler, loginHandler } = await import("./auth"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("returns 400 when registration payload is invalid", async () => {
    const req = {
      body: { username: "", password: "short" },
    } as Request;
    const res = createMockResponse();

    await registerHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        requirement: expect.any(String),
      }),
    );
  });

  it("returns 400 when username already exists", async () => {
    userRepositoryMock.findByUsername.mockResolvedValueOnce({
      id: "user-1",
      username: "alice",
      password: "hashed",
      createdAt: new Date(),
    });

    const req = {
      body: { username: "alice", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await registerHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User already exists",
    });
  });

  it("returns 201 and safe user when registration succeeds", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    userRepositoryMock.findByUsername.mockResolvedValueOnce(null);
    userRepositoryMock.create.mockResolvedValueOnce({
      id: "user-2",
      username: "new-user",
      password: "hashed",
      createdAt,
    });

    const req = {
      body: { username: "new-user", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await registerHandler(req, res);

    expect(userRepositoryMock.create).toHaveBeenCalledWith("new-user", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: "user-2",
          username: "new-user",
          createdAt: createdAt.toISOString(),
        },
      },
    });
  });

  it("returns 500 when registration throws unexpectedly", async () => {
    userRepositoryMock.findByUsername.mockRejectedValueOnce(new Error("db down"));

    const req = {
      body: { username: "new-user", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await registerHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An error occurred during registration",
    });
  });

  it("returns 400 when login payload is invalid", async () => {
    const req = {
      body: { username: "", password: "" },
    } as Request;
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it("returns 401 when user does not exist", async () => {
    userRepositoryMock.findByUsername.mockResolvedValueOnce(null);

    const req = {
      body: { username: "missing-user", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid credentials",
    });
  });

  it("returns 401 when password is incorrect", async () => {
    userRepositoryMock.findByUsername.mockResolvedValueOnce({
      id: "user-3",
      username: "valid-user",
      password:
        "$2b$10$SRT6Rz8So7iw0fY2AxcAY.KwceVMf4Tn0pwS6fH4G0efENwN7hX4m",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const req = {
      body: { username: "valid-user", password: "WrongPassword1!" },
    } as Request;
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid credentials",
    });
  });

  it("returns token and safe user when login succeeds", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const validHash = bcrypt.hashSync("Password1!", 10);
    userRepositoryMock.findByUsername.mockResolvedValueOnce({
      id: "user-3",
      username: "valid-user",
      password: validHash,
      createdAt,
    });

    const req = {
      body: { username: "valid-user", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: "user-3",
            username: "valid-user",
            createdAt: createdAt.toISOString(),
          },
          token: expect.any(String),
        },
      }),
    );
  });

  it("returns 500 when login throws unexpectedly", async () => {
    userRepositoryMock.findByUsername.mockRejectedValueOnce(new Error("db down"));

    const req = {
      body: { username: "valid-user", password: "Password1!" },
    } as Request;
    const res = createMockResponse();

    await loginHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "An error occurred during login",
    });
  });
});
