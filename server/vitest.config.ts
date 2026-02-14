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
      include: ["routes/**/*.ts", "middleware/**/*.ts", "utils/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/__tests__/**",
        "dist/**",
        "generated/**",
        "prisma/**",
        "**/types/**",
      ],
      thresholds: {
        lines: 70,
        functions: 75,
        statements: 70,
        branches: 80,
      },
    },
  },
});
