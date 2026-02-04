import type { SafeUser } from "@app/shared-types";

type ActivityLogStatus = "success" | "error";
type ActivityLogType = "register" | "login";

export interface ActivityLogEntry {
  timestamp: string;
  status: ActivityLogStatus;
  type: ActivityLogType;
  message: string;
  requirement?: string;
  user?: SafeUser;
}
