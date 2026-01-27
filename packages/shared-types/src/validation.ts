import { z } from "zod";

// ============================================
// PASSWORD VALIDATION RULES
// ============================================

/**
 * Individual password requirement checks.
 * Exported for use in real-time validation UI (password hints).
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: {
    check: (password: string) => password.length >= 8,
    message: "Must be at least 8 characters",
  },
  uppercase: {
    check: (password: string) => /[A-Z]/.test(password),
    message: "Must contain at least one uppercase letter",
  },
  lowercase: {
    check: (password: string) => /[a-z]/.test(password),
    message: "Must contain at least one lowercase letter",
  },
  number: {
    check: (password: string) => /\d/.test(password),
    message: "Must contain at least one number",
  },
  specialChar: {
    check: (password: string) => /[@$!%*?&]/.test(password),
    message: "Must contain at least one special character (@$!%*?&)",
  },
} as const;

/**
 * Zod schema for password validation.
 * Enforces all password complexity requirements.
 */
export const passwordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS.minLength.message)
  .regex(/[A-Z]/, PASSWORD_REQUIREMENTS.uppercase.message)
  .regex(/[a-z]/, PASSWORD_REQUIREMENTS.lowercase.message)
  .regex(/\d/, PASSWORD_REQUIREMENTS.number.message)
  .regex(/[@$!%*?&]/, PASSWORD_REQUIREMENTS.specialChar.message);

// ============================================
// AUTH FORM SCHEMAS
// ============================================

/**
 * Schema for login form validation.
 * Only requires non-empty username and password.
 */
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for registration form validation.
 * Includes password complexity rules and confirmation matching.
 */
export const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Schema for server-side registration (no confirmPassword).
 * Used when validating API requests.
 */
export const registerCredentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: passwordSchema,
});

// ============================================
// INFERRED TYPES
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Get the first validation error message from a Zod error.
 * Returns undefined if no errors.
 */
export function getFirstZodError(
  error: z.ZodError,
): { field: string; message: string } | undefined {
  const firstIssue = error.issues[0];
  if (!firstIssue) return undefined;

  return {
    field: firstIssue.path.join(".") || "unknown",
    message: firstIssue.message,
  };
}

/**
 * Check all password requirements and return their status.
 * Useful for displaying real-time validation hints.
 */
export function checkPasswordRequirements(password: string): {
  [K in keyof typeof PASSWORD_REQUIREMENTS]: boolean;
} {
  return {
    minLength: PASSWORD_REQUIREMENTS.minLength.check(password),
    uppercase: PASSWORD_REQUIREMENTS.uppercase.check(password),
    lowercase: PASSWORD_REQUIREMENTS.lowercase.check(password),
    number: PASSWORD_REQUIREMENTS.number.check(password),
    specialChar: PASSWORD_REQUIREMENTS.specialChar.check(password),
  };
}
