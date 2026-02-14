import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/__tests__/**",
        "generated/**",
        "prisma/**",
        "**/types/**",
      ],
      thresholds: {
        lines: 15,
        functions: 15,
        statements: 15,
        branches: 10,
      },
    },
  },
});
