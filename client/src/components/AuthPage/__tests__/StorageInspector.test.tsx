import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  installClipboardMock,
  installLocalStorageMock,
} from "../../../test-utils/mocks";
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

describe("StorageInspector", () => {
  let restoreClipboard: (() => void) | undefined;
  let restoreLocalStorage: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    restoreLocalStorage = installLocalStorageMock();
    localStorage.clear();
    restoreClipboard = installClipboardMock(
      vi.fn().mockResolvedValue(undefined),
    );
  });

  afterEach(() => {
    restoreClipboard?.();
    restoreLocalStorage?.();
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
    restoreClipboard?.();
    restoreClipboard = installClipboardMock(
      vi.fn().mockRejectedValue(new Error("clipboard denied")),
    );

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
