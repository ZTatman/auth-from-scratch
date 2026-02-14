import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOGIN_FLOW_STEPS,
  REGISTER_FLOW_STEPS,
  createLoginSteps,
  createRegisterSteps,
  generateFlowId,
} from "../auth-flow";

describe("auth flow helpers", () => {
  it("creates login steps with pending status", () => {
    const steps = createLoginSteps();

    expect(steps).toHaveLength(LOGIN_FLOW_STEPS.length);
    expect(steps.every((step) => step.status === "pending")).toBe(true);
    expect(steps.map((step) => step.id)).toEqual(
      LOGIN_FLOW_STEPS.map((step) => step.id),
    );
  });

  it("creates register steps with pending status", () => {
    const steps = createRegisterSteps();

    expect(steps).toHaveLength(REGISTER_FLOW_STEPS.length);
    expect(steps.every((step) => step.status === "pending")).toBe(true);
    expect(steps.map((step) => step.id)).toEqual(
      REGISTER_FLOW_STEPS.map((step) => step.id),
    );
  });

  it("generates stable flow ids based on time + randomness", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456789);

    const flowId = generateFlowId();

    expect(flowId).toMatch(/^flow-1700000000000-[a-z0-9]{9}$/);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
