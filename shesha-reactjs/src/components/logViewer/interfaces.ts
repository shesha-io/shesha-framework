import { LogLevel } from "@/providers/processMonitor/interfaces";

// Types
export interface LogLine {
  id: string | number;
  raw?: string | undefined;
  message: string | null;
  level: LogLevel;
  timeStamp?: moment.Moment | undefined;
  isTimeline?: boolean | undefined;
  duration?: number | undefined;
  taskName?: string | undefined;
  hasChildren?: boolean | undefined;
  collapsed?: boolean | undefined;
  displayIndex?: number | undefined;
  originalIndex?: number | undefined;
}
