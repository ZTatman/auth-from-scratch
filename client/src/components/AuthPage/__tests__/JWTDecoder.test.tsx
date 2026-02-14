import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JWTDecoder } from "../JWTDecoder";

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
    warning: vi.fn(),
  },
}));

function createToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function installClipboard(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

describe("JWTDecoder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installClipboard(vi.fn().mockResolvedValue(undefined));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows validation message for invalid token format", async () => {
    render(<JWTDecoder />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "invalid-token" },
    });

    expect(screen.getByText("Invalid JWT token format")).toBeTruthy();
  });

  it("decodes valid token and supports copy", async () => {
    const token = createToken({
      sub: "user-1",
      iat: 1_700_000_000,
      exp: 1_700_003_600,
    });

    render(<JWTDecoder />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: token },
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Token decoded.");
    });

    expect(screen.getByText("Raw Token:")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Token copied to clipboard.");
    });
  });

  it("handles clipboard failure during copy", async () => {
    const token = createToken({ sub: "user-2" });
    installClipboard(vi.fn().mockRejectedValue(new Error("copy failed")));

    render(<JWTDecoder />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: token },
    });

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("copy failed");
    });
  });
});
