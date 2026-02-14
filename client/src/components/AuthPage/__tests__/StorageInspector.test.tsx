import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StorageInspector } from "../StorageInspector";
import { AUTH_STORAGE_EVENT } from "../../../utils/user";

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

function installClipboard(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

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

describe("StorageInspector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installLocalStorageMock();
    localStorage.clear();
    installClipboard(vi.fn().mockResolvedValue(undefined));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty status when no token is stored", () => {
    render(<StorageInspector />);

    expect(screen.getByText("Empty")).toBeTruthy();
    expect(
      screen.getByText("No token stored. Login to see the token here."),
    ).toBeTruthy();
  });

  it("shows token status and copies token", async () => {
    const token = "x".repeat(60);
    localStorage.setItem("auth_token", token);

    render(<StorageInspector />);

    expect(screen.getByText("Token Present")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Token copied to clipboard.");
    });
  });

  it("handles clipboard write errors", async () => {
    localStorage.setItem("auth_token", "abc.def.ghi");
    installClipboard(vi.fn().mockRejectedValue(new Error("clipboard denied")));

    render(<StorageInspector />);

    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("clipboard denied");
    });
  });

  it("reacts to auth storage events", async () => {
    render(<StorageInspector />);
    expect(screen.getByText("Empty")).toBeTruthy();

    localStorage.setItem("auth_token", "event-token");
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));

    await waitFor(() => {
      expect(screen.getByText("Token Present")).toBeTruthy();
    });
  });
});
