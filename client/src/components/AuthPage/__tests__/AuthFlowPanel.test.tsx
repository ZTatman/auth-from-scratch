import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AuthFlowEntry } from "../../../types";
import { createLoginSteps } from "../../../types";
import { AuthFlowPanel } from "../AuthFlowPanel";

vi.mock("../StepVisualizer", () => ({
  StepVisualizer: () => <div data-testid="step-visualizer">steps</div>,
}));

vi.mock("../RequestInspector", () => ({
  RequestInspector: () => <div data-testid="request-inspector">request</div>,
}));

vi.mock("../JWTDecoder", () => ({
  JWTDecoder: () => <div data-testid="jwt-decoder">jwt</div>,
}));

vi.mock("../StorageInspector", () => ({
  StorageInspector: () => <div data-testid="storage-inspector">storage</div>,
}));

vi.mock("../SessionLifecycleSimulator", () => ({
  SessionLifecycleSimulator: () => (
    <div data-testid="session-lifecycle">session</div>
  ),
}));

function createFlow(overrides: Partial<AuthFlowEntry> = {}): AuthFlowEntry {
  return {
    id: "flow-1",
    type: "login",
    status: "success",
    timestamp: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    message: "Login successful",
    steps: createLoginSteps(),
    request: {
      method: "POST",
      url: "/api/login",
      headers: { "Content-Type": "application/json" },
      body: { username: "***", password: "***" },
    },
    response: {
      status: 200,
      statusText: "OK",
      body: { success: true },
    },
    ...overrides,
  };
}

describe("AuthFlowPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state", () => {
    render(<AuthFlowPanel flows={[]} activeFlowId={null} onClear={vi.fn()} />);

    expect(
      screen.getByText("Submit the form to see the authentication flow in action"),
    ).toBeTruthy();
    expect(screen.getByTestId("storage-inspector")).toBeTruthy();
    expect(screen.getByTestId("session-lifecycle")).toBeTruthy();
  });

  it("renders flow entries and clears flows", () => {
    const onClear = vi.fn();

    render(
      <AuthFlowPanel
        flows={[createFlow()]}
        activeFlowId={"flow-1"}
        onClear={onClear}
      />,
    );

    expect(screen.getByText("1 request")).toBeTruthy();
    expect(screen.getByText("Live")).toBeTruthy();
    expect(screen.getByTestId("step-visualizer")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
