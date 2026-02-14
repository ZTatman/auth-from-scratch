import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthPage } from "../AuthPage";

const {
  loginApiMock,
  registerMutateAsyncMock,
  userLoginMock,
  saveTokenMock,
  saveUserMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  loginApiMock: vi.fn(),
  registerMutateAsyncMock: vi.fn(),
  userLoginMock: vi.fn(),
  saveTokenMock: vi.fn(),
  saveUserMock: vi.fn(),
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

vi.mock("../../../api/auth", () => ({
  login: loginApiMock,
}));

vi.mock("../../../hooks", () => ({
  useUser: () => ({
    user: null,
    authToken: null,
    role: "default",
    isAuthenticated: false,
    setAuthToken: vi.fn(),
    setUser: vi.fn(),
    setRole: vi.fn(),
    setIsAuthenticated: vi.fn(),
    login: userLoginMock,
    logout: vi.fn(),
  }),
  useRegister: () => ({
    mutateAsync: registerMutateAsyncMock,
  }),
}));

vi.mock("../../../utils/user", async () => {
  const actual = await vi.importActual<typeof import("../../../utils/user")>(
    "../../../utils/user",
  );

  return {
    ...actual,
    saveToken: saveTokenMock,
    saveUser: saveUserMock,
  };
});

vi.mock("../../NavigationBar/NavigationBar", () => ({
  NavigationBar: () => <div data-testid="mock-navigation">Navigation</div>,
}));

vi.mock("../../AuthForm/AuthForm", () => ({
  AuthForm: ({
    onLogin,
    onRegister,
  }: {
    onLogin: (data: { username: string; password: string }) => Promise<boolean>;
    onRegister: (data: {
      username: string;
      password: string;
      confirmPassword: string;
    }) => Promise<void>;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => void onLogin({ username: "alice", password: "Password1!" })}
      >
        Trigger Login
      </button>
      <button
        type="button"
        onClick={() =>
          void onRegister({
            username: "new-user",
            password: "Password1!",
            confirmPassword: "Password1!",
          })
        }
      >
        Trigger Register
      </button>
    </div>
  ),
}));

vi.mock("../AuthFlowPanel", () => ({
  AuthFlowPanel: ({
    flows,
    activeFlowId,
    onClear,
  }: {
    flows: Array<{ status: string; message?: string }>;
    activeFlowId: string | null;
    onClear: () => void;
  }) => (
    <div>
      <div data-testid="flow-count">{flows.length}</div>
      <div data-testid="active-flow">{activeFlowId ?? "none"}</div>
      <div data-testid="flow-status">{flows[0]?.status ?? "none"}</div>
      <div data-testid="flow-message">{flows[0]?.message ?? ""}</div>
      <button type="button" onClick={onClear}>
        Clear panel
      </button>
    </div>
  ),
}));

async function advanceFlow(ms = 2600): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

  await act(async () => {
    await Promise.resolve();
  });
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("runs login flow and logs user in on success", async () => {
    loginApiMock.mockResolvedValueOnce({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: "user-1",
          username: "alice",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        token: "header.payload.signature",
      },
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger Login" }));

    await advanceFlow();

    expect(loginApiMock).toHaveBeenCalledWith({
      username: "alice",
      password: "Password1!",
    });
    expect(saveTokenMock).toHaveBeenCalledWith("header.payload.signature");
    expect(saveUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
    );
    expect(userLoginMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      "header.payload.signature",
    );
    expect(toastSuccessMock).toHaveBeenCalledWith("Login successful");
    expect(screen.getByTestId("flow-status").textContent).toBe("success");
    expect(screen.getByTestId("active-flow").textContent).toBe("none");
  });

  it("marks login flow as error for invalid credentials", async () => {
    loginApiMock.mockResolvedValueOnce({
      success: false,
      message: "Invalid credentials",
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger Login" }));

    await advanceFlow(1200);

    expect(screen.getByTestId("flow-status").textContent).toBe("error");
    expect(screen.getByTestId("flow-message").textContent).toBe(
      "Invalid credentials",
    );
    expect(toastErrorMock).toHaveBeenCalledWith("Invalid credentials");
  });

  it("runs registration flow and handles failures", async () => {
    registerMutateAsyncMock.mockResolvedValueOnce({
      success: false,
      message: "User already exists",
    });

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger Register" }));

    await advanceFlow(1200);

    expect(screen.getByTestId("flow-status").textContent).toBe("error");
    expect(screen.getByTestId("flow-message").textContent).toBe(
      "User already exists",
    );
    expect(toastErrorMock).toHaveBeenCalledWith("User already exists");

    fireEvent.click(screen.getByRole("button", { name: "Clear panel" }));
    expect(screen.getByTestId("flow-count").textContent).toBe("0");
  });

  it("handles thrown registration errors", async () => {
    registerMutateAsyncMock.mockRejectedValueOnce(
      new Error("Registration failed hard"),
    );

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger Register" }));

    await advanceFlow(1200);

    expect(screen.getByTestId("flow-status").textContent).toBe("error");
    expect(screen.getByTestId("flow-message").textContent).toBe(
      "Registration failed hard",
    );
    expect(toastErrorMock).toHaveBeenCalledWith("Registration failed hard");
  });
});
