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

interface AuthFlowPanelProps {
  flows: AuthFlowEntry[];
  activeFlowId: string | null;
  onClear: () => void;
}

/**
 * Panel displaying authentication flow entries with step visualization.
 */
export function AuthFlowPanel({
  flows,
  activeFlowId,
  onClear,
}: AuthFlowPanelProps) {
  if (flows.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
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
        <span className="text-sm text-muted-foreground">
          {flows.length} {flows.length === 1 ? "request" : "requests"}
        </span>
        <Button variant="ghost" size="sm" onClick={onClear}>
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

  return (
    <div
      className={`rounded-lg border bg-card p-4 transition-all ${
        isActive ? "border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={flow.type === "login" ? "default" : "secondary"}>
            {typeLabel}
          </Badge>
          <Badge variant={statusVariant}>
            {flow.status === "pending" ? "In Progress" : flow.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(flow.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Step Visualizer */}
      <StepVisualizer steps={flow.steps} />

      {/* Message */}
      {flow.message && (
        <p
          className={`mt-3 text-sm ${
            flow.status === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {flow.message}
        </p>
      )}

      {/* Expandable Details */}
      <Accordion type="multiple" className="mt-4">
        {/* Request/Response Inspector */}
        {(flow.request || flow.response) && (
          <AccordionItem value="request">
            <AccordionTrigger className="text-sm">
              Request / Response Details
            </AccordionTrigger>
            <AccordionContent>
              <RequestInspector request={flow.request} response={flow.response} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* JWT Decoder (only for successful login) */}
        {flow.token && (
          <AccordionItem value="token">
            <AccordionTrigger className="text-sm">
              JWT Token Details
            </AccordionTrigger>
            <AccordionContent>
              <JWTDecoder token={flow.token} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
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
