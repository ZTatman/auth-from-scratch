import { useState } from "react";
import type { ActivityLogEntry as ActivityLogEntryType } from "../../types";
import { ActivityLogEntry } from "./ActivityLogEntry";

interface ActivityLogProps {
  entries: ActivityLogEntryType[];
  onClear: () => void;
}

export function ActivityLog({ entries, onClear }: ActivityLogProps) {
  const [isClearing, setIsClearing] = useState(false);
  const sortedEntries = entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleClear = () => {
    setIsClearing(true);
    setTimeout(() => {
      onClear();
      setIsClearing(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-md my-6">
      <hr className="border-t border-gray-300 mb-4" />
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-gray-700">
          Activity Log
        </span>
        <button
          onClick={handleClear}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
          aria-label="Clear activity log"
          title="Clear activity log"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
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
        </button>
      </div>
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="text-gray-400 text-sm text-center p-8">
            No activity yet
          </div>
        ) : (
          sortedEntries.map((entry, idx) => (
            <div
              key={idx}
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
