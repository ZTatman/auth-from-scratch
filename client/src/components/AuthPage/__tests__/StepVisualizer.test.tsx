import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { AuthStep } from "../../../types";
import { StepVisualizer } from "../StepVisualizer";

const steps: AuthStep[] = [
  {
    id: "pending",
    label: "Pending step",
    description: "Pending description",
    status: "pending",
  },
  {
    id: "in-progress",
    label: "In progress step",
    description: "Working",
    status: "in_progress",
  },
  {
    id: "error",
    label: "Error step",
    description: "Errored",
    detail: "Invalid credentials",
    status: "error",
  },
  {
    id: "success",
    label: "Success step",
    description: "Completed",
    status: "success",
  },
];

describe("StepVisualizer", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all step statuses", () => {
    render(<StepVisualizer steps={steps} />);

    expect(screen.getByText("Pending step")).toBeTruthy();
    expect(screen.getByText("In progress step")).toBeTruthy();
    expect(screen.getByText("Error step")).toBeTruthy();
    expect(screen.getByText("Success step")).toBeTruthy();
    expect(screen.getByText("Processing...")).toBeTruthy();
    expect(screen.getByText("Invalid credentials")).toBeTruthy();
  });
});
