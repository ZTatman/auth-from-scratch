import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionLifecycleSimulator } from "../SessionLifecycleSimulator";

const {
  toastWarningMock,
  logoutMock,
  useUserMock,
} = vi.hoisted(() => ({
  toastWarningMock: vi.fn(),
  logoutMock: vi.fn(),
  useUserMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: toastWarningMock,
  },
}));

vi.mock("../../../hooks/useUser", () => ({
  default: useUserMock,
}));

function createToken(expSecondsFromNow: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ iat: nowSeconds, exp: nowSeconds + expSecondsFromNow }),
  );
  return `${header}.${payload}.signature`;
}

describe("SessionLifecycleSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows no-session state and logs warning event for protected request", async () => {
    useUserMock.mockReturnValue({
      authToken: null,
      logout: logoutMock,
    });

    render(<SessionLifecycleSimulator />);

    expect(screen.getByText("No Session")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Simulate protected request" }),
    );

    await waitFor(() => {
      expect(screen.getByText("No session: redirect to /auth.")).toBeTruthy();
    });
  });

  it("allows protected request with active token", async () => {
    useUserMock.mockReturnValue({
      authToken: createToken(3600),
      logout: logoutMock,
    });

    render(<SessionLifecycleSimulator />);

    expect(screen.getByText("Active")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Simulate protected request" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Protected request allowed (token valid)."),
      ).toBeTruthy();
    });
  });

  it("expires active session and logs user out", async () => {
    useUserMock.mockReturnValue({
      authToken: createToken(3600),
      logout: logoutMock,
    });

    render(<SessionLifecycleSimulator />);

    fireEvent.click(screen.getByRole("button", { name: "Expire now" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Simulate protected request" }),
    );

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(toastWarningMock).toHaveBeenCalledWith(
        "Session expired. You have been signed out.",
      );
    });
  });
});
