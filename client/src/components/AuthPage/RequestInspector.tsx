import type { RequestDetails, ResponseDetails } from "../../types";
import { Badge } from "@/components/ui/badge";
import { JsonBlock } from "../JsonBlock/JsonBlock";

interface RequestInspectorProps {
  request?: RequestDetails;
  response?: ResponseDetails;
}

/**
 * Displays request and response details for educational purposes.
 */
export function RequestInspector({ request, response }: RequestInspectorProps) {
  return (
    <div className="space-y-4 text-sm">
      {/* Request Section */}
      {request && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{request.method}</Badge>
            <code className="text-muted-foreground text-xs">{request.url}</code>
          </div>

          {/* Headers */}
          <div className="mb-2">
            <span className="text-muted-foreground text-xs font-medium">
              Headers:
            </span>
            <JsonBlock data={request.headers} className="mt-1" />
          </div>

          {/* Request Body */}
          <div>
            <span className="text-muted-foreground text-xs font-medium">
              Request Body:
            </span>
            <JsonBlock data={request.body} className="mt-1" />
            <p className="text-muted-foreground mt-1 text-xs italic">
              Note: Password masked as "***" for security
            </p>
          </div>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={response.status < 400 ? "default" : "destructive"}>
              {response.status}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {response.statusText}
            </span>
          </div>

          {/* Response Body */}
          <div>
            <span className="text-muted-foreground text-xs font-medium">
              Response Body:
            </span>
            <JsonBlock
              data={sanitizeResponseBody(response.body)}
              maxHeight="10rem"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="rounded-md border border-dashed p-3">
        <p className="text-muted-foreground text-xs">
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
