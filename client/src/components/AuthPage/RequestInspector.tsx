import type { ReactNode } from "react";
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
            <JsonBlock data={request.headers} />
          </div>

          {/* Request Body */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Request Body:
            </span>
            <JsonBlock data={request.body} />
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
            <JsonBlock data={sanitizeResponseBody(response.body)} maxHeight="10rem" />
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

// ============================================
// JSON Syntax Highlighting
// ============================================

interface JsonBlockProps {
  data: unknown;
  maxHeight?: string;
}

/**
 * Renders JSON with syntax highlighting and proper formatting.
 */
function JsonBlock({ data, maxHeight }: JsonBlockProps) {
  return (
    <pre
      className="mt-1 overflow-auto rounded-md bg-muted p-3 text-left text-xs font-mono"
      style={{ maxHeight }}
    >
      <JsonValue value={data} indent={0} />
    </pre>
  );
}

interface JsonValueProps {
  value: unknown;
  indent: number;
}

/**
 * Recursively renders JSON values with syntax highlighting.
 */
function JsonValue({ value, indent }: JsonValueProps): ReactNode {
  const indentStr = "  ".repeat(indent);
  const nextIndent = indent + 1;
  const nextIndentStr = "  ".repeat(nextIndent);

  // Null
  if (value === null) {
    return <span className="text-orange-500 dark:text-orange-400">null</span>;
  }

  // Boolean
  if (typeof value === "boolean") {
    return (
      <span className="text-orange-500 dark:text-orange-400">
        {value ? "true" : "false"}
      </span>
    );
  }

  // Number
  if (typeof value === "number") {
    return (
      <span className="text-blue-600 dark:text-blue-400">{value}</span>
    );
  }

  // String
  if (typeof value === "string") {
    return (
      <span className="text-green-600 dark:text-green-400">"{value}"</span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-foreground">[]</span>;
    }
    return (
      <>
        <span className="text-foreground">[</span>
        {"\n"}
        {value.map((item, index) => (
          <span key={index}>
            {nextIndentStr}
            <JsonValue value={item} indent={nextIndent} />
            {index < value.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {indentStr}
        <span className="text-foreground">]</span>
      </>
    );
  }

  // Object
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-foreground">{"{}"}</span>;
    }
    return (
      <>
        <span className="text-foreground">{"{"}</span>
        {"\n"}
        {entries.map(([key, val], index) => (
          <span key={key}>
            {nextIndentStr}
            <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
            <span className="text-foreground">: </span>
            <JsonValue value={val} indent={nextIndent} />
            {index < entries.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {indentStr}
        <span className="text-foreground">{"}"}</span>
      </>
    );
  }

  // Fallback
  return <span className="text-foreground">{String(value)}</span>;
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
