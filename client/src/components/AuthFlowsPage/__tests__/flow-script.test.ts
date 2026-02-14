import { describe, expect, it } from "vitest";

import {
  DEFAULT_FLOW_ID,
  FLOW_REGISTRY,
  JWT_FLOW_SCRIPT,
  assertValidFlowScript,
  getFlowDefinitionById,
  getFlowDefinitionList,
  validateFlowScript,
  type FlowScript,
} from "../flow-script";

describe("flow script validation", () => {
  it("accepts the JWT flow script", () => {
    const errors = validateFlowScript(JWT_FLOW_SCRIPT);

    expect(errors).toEqual([]);
    expect(() => assertValidFlowScript(JWT_FLOW_SCRIPT)).not.toThrow();
  });

  it("rejects events that reference unknown participants", () => {
    const invalidScript: FlowScript = {
      participants: JWT_FLOW_SCRIPT.participants,
      steps: [
        {
          ...JWT_FLOW_SCRIPT.steps[0],
          from: "unknown",
        },
      ],
      assumptions: JWT_FLOW_SCRIPT.assumptions,
      prerequisites: JWT_FLOW_SCRIPT.prerequisites,
      whatThisProves: JWT_FLOW_SCRIPT.whatThisProves,
      id: "invalid",
      protocol: "jwt",
      title: "Invalid",
      version: "1.0.0",
    };

    const errors = validateFlowScript(invalidScript);

    expect(errors.some((error) => error.includes("unknown source participant"))).toBe(
      true,
    );
    expect(() => assertValidFlowScript(invalidScript)).toThrow();
  });

  it("returns a default flow for unknown flow IDs", () => {
    const fallbackFlow = getFlowDefinitionById("does-not-exist");

    expect(fallbackFlow.id).toBe(DEFAULT_FLOW_ID);
  });

  it("returns registry entries in UI order", () => {
    const flowList = getFlowDefinitionList();

    expect(flowList.length).toBeGreaterThanOrEqual(3);
    expect(flowList[0].id).toBe(DEFAULT_FLOW_ID);
    expect(FLOW_REGISTRY[flowList[0].id]).toBeTruthy();
  });
});
