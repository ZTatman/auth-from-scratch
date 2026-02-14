import { describe, expect, it } from "vitest";

import type { User } from "../generated/prisma/client";
import { toSafeUser } from "./response";

describe("toSafeUser", () => {
  it("removes sensitive fields and normalizes dates", () => {
    const createdAt = new Date("2024-01-01T12:00:00.000Z");
    const user: User = {
      id: "user-1",
      username: "codex",
      password: "hashed-password",
      createdAt,
    };

    const safeUser = toSafeUser(user);

    expect(safeUser).toEqual({
      id: "user-1",
      username: "codex",
      createdAt: createdAt.toISOString(),
    });
  });
});
