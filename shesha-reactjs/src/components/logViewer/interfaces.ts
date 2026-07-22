import { LogLevel } from "@/providers/processMonitor/interfaces";

export type ListItemProps = {
  text: string;
};

export interface IListViewProps {
  data: LogLine[];
  autoScroll?: boolean | undefined;
}


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

export interface SearchMatch {
  index: number;
  length: number;
}
