import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================
// JSON SYNTAX HIGHLIGHTING COMPONENTS
// ============================================

interface JsonBlockProps {
  data: unknown;
  maxHeight?: string;
  className?: string;
}

/**
 * Renders JSON with proper formatting and syntax highlighting.
 */
export function JsonBlock({ data, maxHeight, className }: JsonBlockProps) {
  return (
    <pre
      className={cn(
        "bg-muted overflow-auto rounded-md p-3 text-left font-mono text-xs",
        className,
      )}
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
    return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
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
            <span className="text-purple-600 dark:text-purple-400">
              "{key}"
            </span>
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
