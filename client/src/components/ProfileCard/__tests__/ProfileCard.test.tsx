import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileCard } from "../ProfileCard";

describe("ProfileCard", () => {
  afterEach(() => {
    cleanup();
  });

  const user = {
    id: "user-1",
    username: "codex",
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  it("renders account details and handles sign out", () => {
    const onLogout = vi.fn();

    render(
      <ProfileCard
        user={user}
        onLogout={onLogout}
        onDeleteAccount={vi.fn().mockResolvedValue(false)}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Account Details")).toBeTruthy();
    expect(screen.getByText("codex")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("opens dialog and confirms account deletion", async () => {
    const onDeleteAccount = vi.fn().mockResolvedValue(true);

    render(
      <ProfileCard
        user={user}
        onLogout={vi.fn()}
        onDeleteAccount={onDeleteAccount}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Delete Account" })[0]);

    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() => {
      expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows fallback when no user is available", () => {
    render(
      <ProfileCard
        user={null}
        onLogout={vi.fn()}
        onDeleteAccount={vi.fn().mockResolvedValue(false)}
        isDeleting={false}
        deleteError="Deletion failed"
      />,
    );

    expect(screen.getByText("No user data available.")).toBeTruthy();
    expect(screen.getAllByText("Deletion failed").length).toBeGreaterThan(0);
  });
});
