import type { RequestDetails, ResponseDetails } from "../../types";
import { Badge } from "@/components/ui/badge";

interface RequestInspectorProps {
  request?: RequestDetails;
  response?: ResponseDetails;
}

/**
 * Displays request and response details for educational purposes.
 */
export function RequestInspector({
  request,
  response,
}: RequestInspectorProps) {
  return (
    <div className="space-y-4 text-sm">
      {/* Request Section */}
      {request && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{request.method}</Badge>
            <code className="text-xs text-muted-foreground">{request.url}</code>
          </div>

          {/* Headers */}
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Headers:
            </span>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
              {JSON.stringify(request.headers, null, 2)}
            </pre>
          </div>

          {/* Request Body */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Request Body:
            </span>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
              {JSON.stringify(request.body, null, 2)}
            </pre>
            <p className="mt-1 text-xs italic text-muted-foreground">
              Note: Password masked as "***" for security
            </p>
          </div>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant={response.status < 400 ? "default" : "destructive"}
            >
              {response.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {response.statusText}
            </span>
          </div>

          {/* Response Body */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Response Body:
            </span>
            <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
              {JSON.stringify(sanitizeResponseBody(response.body), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="rounded-md border border-dashed p-3">
        <p className="text-xs text-muted-foreground">
          <strong>What's happening:</strong> The client sends an HTTP request to
          the server with credentials. The server validates the input, checks
          the database, and returns a response. For login, the response includes
          a JWT token for future authenticated requests.
        </p>
      </div>
    </div>
  );
}

/**
 * Sanitize response body for display (mask sensitive data).
 */
function sanitizeResponseBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized = { ...body };

  // Mask token in nested data object
  if (
    sanitized.data &&
    typeof sanitized.data === "object" &&
    sanitized.data !== null
  ) {
    const data = sanitized.data as Record<string, unknown>;
    if (data.token && typeof data.token === "string") {
      sanitized.data = {
        ...data,
        token: data.token.substring(0, 20) + "...[truncated]",
      };
    }
  }

  return sanitized;
}
