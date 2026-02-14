import { describe, expect, it } from "vitest";

import { createLoginSteps, createRegisterSteps } from "../index";

describe("types barrel exports", () => {
  it("re-exports auth-flow helpers", () => {
    expect(createLoginSteps().length).toBeGreaterThan(0);
    expect(createRegisterSteps().length).toBeGreaterThan(0);
  });
});
