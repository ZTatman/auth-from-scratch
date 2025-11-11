import type { ActivityLogEntry as ActivityLogEntryType } from "../../types";
import { TextBlock } from "./TextBlock";

interface ActivityLogEntryProps {
  entry: ActivityLogEntryType;
}

export function ActivityLogEntry({ entry }: ActivityLogEntryProps) {
  const actionTitle = entry.type === "register" ? "Register" : "Login";
  return (
    <div
      className={`activity-log-entry rounded-lg px-4 py-3 shadow-md border border-gray-200 flex items-start gap-3 w-full text-left`}
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-sm font-bold text-gray-800">{actionTitle}</div>
          <div className="text-xs text-gray-500 shrink-0">
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
        <div className="text-xs text-gray-600 wrap-break-word text-left">
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
          {entry.token && <TextBlock label="Token" value={entry.token} />}
        </div>
      </div>
      <div className="shrink-0 mt-0.5">
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
