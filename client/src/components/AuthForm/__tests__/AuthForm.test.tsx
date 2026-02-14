import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installClipboardMock } from "../../../test-utils/mocks";
import { AuthForm } from "../AuthForm";

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("AuthForm", () => {
  let restoreClipboard: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    restoreClipboard = installClipboardMock(
      vi.fn().mockResolvedValue(undefined),
    );
  });

  afterEach(() => {
    restoreClipboard?.();
    cleanup();
  });

  it("submits registration when passwords match", async () => {
    const onLogin = vi.fn().mockResolvedValue(false);
    const onRegister = vi.fn().mockResolvedValue(undefined);

    render(<AuthForm onLogin={onLogin} onRegister={onRegister} />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "  alice  " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith({
        username: "alice",
        password: "Password1!",
        confirmPassword: "Password1!",
      });
    });
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("shows error when registration password confirmation does not match", async () => {
    const onLogin = vi.fn().mockResolvedValue(false);
    const onRegister = vi.fn().mockResolvedValue(undefined);

    render(<AuthForm onLogin={onLogin} onRegister={onRegister} />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password2!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Password confirmation does not match.",
      );
    });
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("switches to login mode and clears fields after successful login", async () => {
    const onLogin = vi.fn().mockResolvedValue(true);
    const onRegister = vi.fn().mockResolvedValue(undefined);

    render(<AuthForm onLogin={onLogin} onRegister={onRegister} />);

    const modeToggle = screen.getByRole("checkbox");
    fireEvent.click(modeToggle);

    expect(screen.queryByLabelText("Confirm Password")).toBeNull();

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "bob" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        username: "bob",
        password: "Password1!",
      });
    });

    await waitFor(() => {
      const username = screen.getByLabelText("Username") as HTMLInputElement;
      const password = screen.getByLabelText("Password") as HTMLInputElement;
      expect(username.value).toBe("");
      expect(password.value).toBe("");
    });
  });

  it("generates credentials and hydrates form fields", async () => {
    const onLogin = vi.fn().mockResolvedValue(false);
    const onRegister = vi.fn().mockResolvedValue(undefined);

    render(<AuthForm onLogin={onLogin} onRegister={onRegister} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Generate random credentials" }),
    );

    await waitFor(() => {
      const username = screen.getByLabelText("Username") as HTMLInputElement;
      const password = screen.getByLabelText("Password") as HTMLInputElement;
      const confirmPassword = screen.getByLabelText(
        "Confirm Password",
      ) as HTMLInputElement;

      expect(username.value.length).toBeGreaterThan(0);
      expect(password.value.length).toBeGreaterThan(0);
      expect(confirmPassword.value).toBe(password.value);
    });
  });
});
