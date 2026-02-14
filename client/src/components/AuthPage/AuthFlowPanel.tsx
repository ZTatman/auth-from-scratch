import { memo, useEffect, useMemo, useState, type ReactElement } from "react";
import type { AuthFlowEntry } from "../../types";

// shadcn components
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Components
import { StepVisualizer } from "./StepVisualizer";
import { RequestInspector } from "./RequestInspector";
import { JWTDecoder } from "./JWTDecoder";
import { StorageInspector } from "./StorageInspector";
import { SessionLifecycleSimulator } from "./SessionLifecycleSimulator";

interface AuthFlowPanelProps {
  flows: AuthFlowEntry[];
  activeFlowId: string | null;
  onClear: () => void;
}

/**
 * Panel displaying authentication flow entries with step visualization.
 * @param flows - Array of authentication flow entries to display
 * @param activeFlowId - ID of the currently active flow, or null if none
 * @param onClear - Callback to clear all flows
 * @returns JSX element
 */
export function AuthFlowPanel({
  flows,
  activeFlowId,
  onClear,
}: AuthFlowPanelProps): ReactElement {
  if (flows.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center">
          <div className="mb-2 text-4xl">🔐</div>
          <p className="text-center text-sm">
            Submit the form to see the authentication flow in action
          </p>
        </div>

        {/* Storage Inspector - always visible */}
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 text-sm font-medium">Token Storage</h3>
          <StorageInspector />
        </div>

        {/* Session Lifecycle Simulator */}
        <div className="mt-6 border-t pt-4">
          <SessionLifecycleSimulator />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with clear button */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {flows.length} {flows.length === 1 ? "request" : "requests"}
        </span>
        <Button
          variant="link"
          size="sm"
          className="px-0 text-primary hover:text-primary/80"
          onClick={onClear}
        >
          Clear all
        </Button>
      </div>

      {/* Flow entries */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {flows.map((flow) => (
          <AuthFlowEntryCard
            key={flow.id}
            flow={flow}
            isActive={flow.id === activeFlowId}
          />
        ))}
      </div>

      {/* Storage Inspector - always visible */}
      <div className="mt-6 border-t pt-4">
        <h3 className="mb-3 text-sm font-medium">Token Storage</h3>
        <StorageInspector />
      </div>

      {/* Session Lifecycle Simulator */}
      <div className="mt-6 border-t pt-4">
        <SessionLifecycleSimulator />
      </div>
    </div>
  );
}

interface AuthFlowEntryCardProps {
  flow: AuthFlowEntry;
  isActive: boolean;
}

/**
 * Individual auth flow entry card with expandable details.
 * @param flow - The authentication flow entry data
 * @param isActive - Whether this is the currently active flow
 * @returns JSX element
 */
const AuthFlowEntryCard = memo(function AuthFlowEntryCard({
  flow,
  isActive,
}: AuthFlowEntryCardProps): ReactElement {
  const typeLabel = flow.type === "login" ? "Login" : "Register";

  // Auto-expand request/response if it's the active flow or just finished with an error
  const defaultExpanded = useMemo(() => {
    const expanded = isActive || flow.status === "error" ? ["request"] : [];
    if (flow.type === "login" && flow.status === "success") {
      expanded.push("token");
    }
    return expanded;
  }, [isActive, flow.status, flow.type]);

  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div
      className={`bg-card group relative overflow-hidden rounded-lg border transition-all duration-300 ${
        isActive
          ? "border-primary shadow-primary/10 ring-primary/20 z-10 scale-[1.02] shadow-md ring-4"
          : "hover:border-muted-foreground/30 opacity-90 shadow-sm"
      }`}
    >
      {/* Active Flow Indicator Bar */}
      {isActive && (
        <div className="bg-primary absolute top-0 right-0 bottom-0 w-1 animate-pulse" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-5 flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-semibold">
              {typeLabel}
            </span>
            {isActive && (
              <span className="text-primary text-xs font-medium">Live</span>
            )}
          </div>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            {new Date(flow.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Step Visualizer */}
        <div className="mt-2 rounded-md">
          <StepVisualizer steps={flow.steps} />
        </div>

        {/* Message */}
        {flow.message && (
          <div
            className={`mt-6 rounded-md p-3 text-xs font-medium ${
              flow.status === "error"
                ? "bg-destructive/10 text-destructive border-destructive/20 border"
                : "border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
            }`}
          >
            {flow.message}
          </div>
        )}

        {/* Expandable Details */}
        <Accordion
          type="multiple"
          className="mt-5"
          value={expanded}
          onValueChange={setExpanded}
        >
          {/* Request/Response Inspector */}
          {(flow.request || flow.response) && (
            <AccordionItem value="request">
              <AccordionTrigger className="text-xs">
                Request / Response Details
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <RequestInspector
                  request={flow.request}
                  response={flow.response}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* JWT Decoder (only for successful login) */}
          {flow.type === "login" && flow.status === "success" && (
            <AccordionItem value="token">
              <AccordionTrigger className="text-xs">
                JWT Token Details
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <JWTDecoder />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
});

/**
 * Get the badge variant based on status.
 * @param status - The authentication flow status
 * @returns Badge variant string
 */
// Status badge removed to reduce visual clutter.
