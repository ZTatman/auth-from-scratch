import type { AuthStep, AuthStepStatus } from "../../types";
import { Badge } from "@/components/ui/badge";

interface StepVisualizerProps {
  steps: AuthStep[];
}

/**
 * Visualizes authentication flow steps with status indicators.
 */
export function StepVisualizer({ steps }: StepVisualizerProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <StepItem key={step.id} step={step} stepNumber={index + 1} />
      ))}
    </div>
  );
}

interface StepItemProps {
  step: AuthStep;
  stepNumber: number;
}

/**
 * Individual step item with status icon, label, and description.
 */
function StepItem({ step, stepNumber }: StepItemProps) {
  const isPending = step.status === "pending";
  const isError = step.status === "error";
  const isInProgress = step.status === "in_progress";

  return (
    <div className="flex items-start gap-3">
      {/* Step number */}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isPending
            ? "bg-muted text-muted-foreground"
            : isError
              ? "bg-destructive/20 text-destructive"
              : isInProgress
                ? "bg-primary/20 text-primary"
                : "bg-green-500/20 text-green-600 dark:text-green-400"
        }`}
      >
        {stepNumber}
      </span>

      {/* Status icon */}
      <div className="mt-0.5">
        <StatusIcon status={step.status} />
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              isPending
                ? "text-muted-foreground"
                : isError
                  ? "text-destructive"
                  : "text-foreground"
            }`}
          >
            {step.label}
          </span>
          {isInProgress && (
            <Badge variant="outline" className="text-xs">
              Processing...
            </Badge>
          )}
        </div>
        <p
          className={`text-sm ${
            isPending ? "text-muted-foreground/60" : "text-muted-foreground"
          }`}
        >
          {step.detail || step.description}
        </p>
      </div>
    </div>
  );
}

interface StatusIconProps {
  status: AuthStepStatus;
}

/**
 * Status icon component showing different states.
 */
function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "success":
      return (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          className="h-4 w-4 text-destructive"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case "in_progress":
      return (
        <svg
          className="h-4 w-4 animate-spin text-primary"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    case "pending":
    default:
      return (
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}
