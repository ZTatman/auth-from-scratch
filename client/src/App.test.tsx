import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { ApiError } from "./lib/api-client";

const {
  useUserMock,
  useGetProfileMock,
  useDeleteAccountMock,
  logoutMock,
  mutateAsyncMock,
  toastSuccessMock,
} = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useGetProfileMock: vi.fn(),
  useDeleteAccountMock: vi.fn(),
  logoutMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("./hooks/useUser", () => ({
  default: useUserMock,
}));

vi.mock("./hooks/api/useProfile", () => ({
  useGetProfile: useGetProfileMock,
  useDeleteAccount: useDeleteAccountMock,
}));

vi.mock("./components/UserContext/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("./components/NavigationBar/NavigationBar", () => ({
  NavigationBar: () => <div data-testid="mock-nav">nav</div>,
}));

vi.mock("./components/ProfileCard/ProfileCard", () => ({
  ProfileCard: ({
    user,
    onLogout,
    onDeleteAccount,
    isDeleting,
    deleteError,
  }: {
    user: { username?: string } | null;
    onLogout: () => void;
    onDeleteAccount: () => Promise<boolean>;
    isDeleting: boolean;
    deleteError: string | null;
  }) => (
    <div>
      <div data-testid="profile-user">{user?.username ?? "none"}</div>
      <div data-testid="profile-delete-state">{isDeleting ? "pending" : "idle"}</div>
      <div data-testid="profile-delete-error">{deleteError ?? ""}</div>
      <button type="button" onClick={onLogout}>
        Mock Logout
      </button>
      <button type="button" onClick={() => void onDeleteAccount()}>
        Mock Delete
      </button>
    </div>
  ),
}));

vi.mock("./components/AuthPage/AuthPage", () => ({
  AuthPage: () => <div>Mock Auth Page</div>,
}));

vi.mock("./components/AuthFlowsPage/AuthFlowsPage", () => ({
  AuthFlowsPage: () => <div>Mock Auth Flows Page</div>,
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useUserMock.mockReturnValue({
      isAuthInitialized: true,
      isAuthenticated: false,
      user: null,
      authToken: null,
      logout: logoutMock,
    });
    useGetProfileMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    useDeleteAccountMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      data: undefined,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated users from home to auth", async () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(await screen.findByText("Mock Auth Page")).toBeTruthy();
  });

  it("renders welcome message for authenticated home route", async () => {
    useUserMock.mockReturnValue({
      isAuthInitialized: true,
      isAuthenticated: true,
      user: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      authToken: "token",
      logout: logoutMock,
    });

    window.history.pushState({}, "", "/");

    render(<App />);

    expect(await screen.findByText("Welcome, alice!")).toBeTruthy();
  });

  it("renders profile loading state", async () => {
    useUserMock.mockReturnValue({
      isAuthInitialized: true,
      isAuthenticated: true,
      user: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      authToken: "token",
      logout: logoutMock,
    });

    useGetProfileMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    });

    window.history.pushState({}, "", "/profile");
    render(<App />);

    expect(await screen.findByText("Loading profile...")).toBeTruthy();
  });

  it("renders profile error state and logs user out for token errors", async () => {
    useUserMock.mockReturnValue({
      isAuthInitialized: true,
      isAuthenticated: true,
      user: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      authToken: "token",
      logout: logoutMock,
    });

    useGetProfileMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new ApiError("token expired", 401),
    });

    window.history.pushState({}, "", "/profile");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Error: token expired")).toBeTruthy();
      expect(logoutMock).toHaveBeenCalled();
    });
  });

  it("handles profile success and delete account flow", async () => {
    mutateAsyncMock.mockResolvedValue({ success: true });

    useUserMock.mockReturnValue({
      isAuthInitialized: true,
      isAuthenticated: true,
      user: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      authToken: "token",
      logout: logoutMock,
    });

    useGetProfileMock.mockReturnValue({
      data: {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
    });

    window.history.pushState({}, "", "/profile");

    render(<App />);

    expect((await screen.findByTestId("profile-user")).textContent).toBe(
      "alice",
    );

    fireEvent.click(screen.getByRole("button", { name: "Mock Logout" }));

    expect(toastSuccessMock).toHaveBeenCalledWith("Signed out");

    fireEvent.click(screen.getByRole("button", { name: "Mock Delete" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
