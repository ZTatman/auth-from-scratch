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
    <div className="relative space-y-0">
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          stepNumber={index + 1}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
}

interface StepItemProps {
  step: AuthStep;
  stepNumber: number;
  isLast?: boolean;
}

/**
 * Individual step item with status icon, label, and description.
 */
function StepItem({ step, stepNumber, isLast }: StepItemProps) {
  const isPending = step.status === "pending";
  const isError = step.status === "error";
  const isInProgress = step.status === "in_progress";

  return (
    <div className="relative pb-6 last:pb-0">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={`absolute top-6 left-3 h-full w-0.5 -translate-x-1/2 ${
            isPending ? "bg-muted" : "bg-primary/20"
          }`}
        />
      )}

      {/* Main row: number, icon, label */}
      <div className="flex items-start gap-3">
        <div className="relative z-10">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
              isPending
                ? "bg-muted text-muted-foreground"
                : isError
                  ? "bg-destructive text-destructive-foreground"
                  : isInProgress
                    ? "bg-primary animate-pulse text-primary-foreground"
                    : "bg-green-500 text-white"
            }`}
          >
            {stepNumber}
          </span>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <StatusIcon status={step.status} />
            <span
              className={`text-sm font-semibold transition-colors ${
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
              <Badge
                variant="outline"
                className="bg-primary/5 animate-pulse text-[10px] py-0 h-4"
              >
                Processing...
              </Badge>
            )}
          </div>

          {/* Description: left-aligned */}
          <p
            className={`text-xs leading-relaxed transition-colors ${
              isPending ? "text-muted-foreground/60" : "text-muted-foreground"
            }`}
          >
            {step.detail || step.description}
          </p>
        </div>
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
          className="text-destructive h-4 w-4"
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
          className="text-primary h-4 w-4 animate-spin"
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
          className="text-muted-foreground h-4 w-4"
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
