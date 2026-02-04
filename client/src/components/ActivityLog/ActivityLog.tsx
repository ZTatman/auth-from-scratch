import { useMemo, useState } from "react";

// Components
import { Button } from "@/components/ui/button";
import type { ActivityLogEntry as ActivityLogEntryType } from "../../types";
import { ActivityLogEntry } from "./ActivityLogEntry";

interface ActivityLogProps {
  entries: ActivityLogEntryType[];
  onClear: () => void;
}

export function ActivityLog({ entries, onClear }: ActivityLogProps) {
  const [isClearing, setIsClearing] = useState(false);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [entries],
  );

  const handleClear = () => {
    setIsClearing(true);
    setTimeout(() => {
      onClear();
      setIsClearing(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-md">
      <hr className="mb-4 border-t border-border" />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground">
          Activity Log
        </span>
        <Button
          onClick={handleClear}
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          aria-label="Clear activity log"
          title="Clear activity log"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No activity yet
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div
              key={`${entry.timestamp}-${entry.type}-${entry.status}`}
              className={isClearing ? "activity-log-entry-exit" : ""}
            >
              <ActivityLogEntry entry={entry} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
