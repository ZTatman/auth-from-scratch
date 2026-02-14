import { describe, expect, it } from "vitest";

import { createLoginSteps, createRegisterSteps } from "../index";

describe("types barrel exports", () => {
  it("re-exports auth-flow helpers", () => {
    expect(typeof createLoginSteps).toBe("function");
    expect(typeof createRegisterSteps).toBe("function");
  });
});
