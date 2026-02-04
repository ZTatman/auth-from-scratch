import type { ActivityLogEntry as ActivityLogEntryType } from "../../types";
import { TextBlock } from "./TextBlock";

interface ActivityLogEntryProps {
  entry: ActivityLogEntryType;
}

export function ActivityLogEntry({ entry }: ActivityLogEntryProps) {
  const actionTitle = entry.type === "register" ? "Register" : "Login";
  return (
    <div
      className={`activity-log-entry flex w-full items-start gap-3 rounded-lg bg-card px-4 py-3 text-left shadow-sm`}
    >
      <div className="min-w-0 flex-1 text-left">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="text-sm font-bold text-foreground">
            {actionTitle}
          </div>
          <div className="shrink-0 text-xs text-muted-foreground">
            {new Date(entry.timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
        <div className="text-left text-xs wrap-break-word text-muted-foreground">
          <TextBlock label="Message" value={entry.message} />
          {entry.user && (
            <TextBlock label="Username" value={entry.user.username} />
          )}
          {entry.requirement && (
            <TextBlock
              label="Requirement"
              value={entry.requirement}
              variant="error"
            />
          )}
        </div>
      </div>
      <div className="mt-0.5 shrink-0">
        {entry.status === "success" ? (
          <svg
            className="h-5 w-5 text-green-500"
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
        ) : (
          <svg
            className="h-5 w-5 text-red-500"
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
        )}
      </div>
    </div>
  );
}
