import type { AuthFlowEntry } from "../../types";

// shadcn components
import { Badge } from "@/components/ui/badge";
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

interface PendingLogin {
  user: { id: string; username: string; createAt: string };
  token: string;
}

interface AuthFlowPanelProps {
  flows: AuthFlowEntry[];
  activeFlowId: string | null;
  onClear: () => void;
  pendingLogin?: PendingLogin | null;
  onContinueLogin?: () => void;
}

/**
 * Panel displaying authentication flow entries with step visualization.
 */
export function AuthFlowPanel({
  flows,
  activeFlowId,
  onClear,
  pendingLogin,
  onContinueLogin,
}: AuthFlowPanelProps) {
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
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear all
        </Button>
      </div>

      {/* Pending Login Banner */}
      {pendingLogin && onContinueLogin && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl border-2 border-green-500/30 bg-green-500/5 p-5 shadow-lg shadow-green-500/5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-md shadow-green-500/20">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                  Authentication Verified!
                </h3>
                <p className="text-muted-foreground text-xs font-medium">
                  Welcome back, {pendingLogin.user.username}
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                Session Ready
              </Badge>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-0 text-sm leading-relaxed">
            All steps completed successfully. Your JWT token has been generated and stored. 
            Review the flow details below or proceed to your dashboard.
          </p>
        </div>
      )}

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
    </div>
  );
}

interface AuthFlowEntryCardProps {
  flow: AuthFlowEntry;
  isActive: boolean;
}

/**
 * Individual auth flow entry card with expandable details.
 */
function AuthFlowEntryCard({ flow, isActive }: AuthFlowEntryCardProps) {
  const statusVariant = getStatusVariant(flow.status);
  const typeLabel = flow.type === "login" ? "Login" : "Register";

  // Auto-expand request/response if it's the active flow or just finished with an error
  const defaultExpanded = isActive || flow.status === "error" ? ["request"] : [];
  if (flow.token) defaultExpanded.push("token");

  return (
    <div
      className={`bg-card group relative overflow-hidden rounded-lg border transition-all duration-300 ${
        isActive
          ? "border-primary shadow-primary/10 ring-primary/20 scale-[1.02] z-10 shadow-lg ring-4"
          : "hover:border-muted-foreground/30 opacity-90 shadow-sm"
      }`}
    >
      {/* Active Flow Indicator Bar */}
      {isActive && (
        <div className="bg-primary absolute top-0 right-0 bottom-0 w-1 animate-pulse" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={flow.type === "login" ? "default" : "secondary"}
              className="px-2 py-0"
            >
              {typeLabel}
            </Badge>
            <Badge variant={statusVariant} className="flex items-center gap-1">
              {flow.status === "pending" && (
                <span className="bg-background h-1.5 w-1.5 animate-pulse rounded-full" />
              )}
              {flow.status === "pending" ? "Active Flow" : flow.status}
            </Badge>
            {isActive && (
              <Badge
                variant="outline"
                className="border-primary text-primary animate-pulse border-dashed bg-transparent"
              >
                Live
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
            {new Date(flow.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Step Visualizer */}
        <div className="bg-muted/30 rounded-md p-4">
          <StepVisualizer steps={flow.steps} />
        </div>

        {/* Message */}
        {flow.message && (
          <div
            className={`mt-4 rounded-md p-3 text-xs font-medium ${
              flow.status === "error"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-green-500/10 text-green-700 border border-green-500/20 dark:text-green-400"
            }`}
          >
            {flow.message}
          </div>
        )}

        {/* Expandable Details */}
        <Accordion
          type="multiple"
          className="mt-4"
          defaultValue={defaultExpanded}
        >
          {/* Request/Response Inspector */}
          {(flow.request || flow.response) && (
            <AccordionItem value="request" className="border-none">
              <AccordionTrigger className="hover:bg-muted/50 rounded-md px-2 py-2 text-xs transition-colors no-underline">
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
          {flow.token && (
            <AccordionItem value="token" className="border-none">
              <AccordionTrigger className="hover:bg-muted/50 rounded-md px-2 py-2 text-xs transition-colors no-underline">
                JWT Token Details
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <JWTDecoder token={flow.token} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
}

/**
 * Get the badge variant based on status.
 */
function getStatusVariant(
  status: AuthFlowEntry["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "success":
      return "default";
    case "error":
      return "destructive";
    case "pending":
      return "outline";
    default:
      return "secondary";
  }
}
