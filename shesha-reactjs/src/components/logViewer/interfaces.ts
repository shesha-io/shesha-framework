import { LogLevel } from "@/providers/processMonitor/interfaces";

export type ListItemProps = {
  text: string;
};

export interface IListViewProps {
  data: LogLine[];
  autoScroll?: boolean;
}


// Types
export interface LogLine {
  id: string | number;
  raw?: string;
  message: string;
  level: LogLevel;
  timeStamp?: moment.Moment;
  isTimeline?: boolean;
  duration?: number;
  taskName?: string;
  hasChildren?: boolean;
  collapsed?: boolean;
  displayIndex?: number;
  originalIndex?: number;
}

export interface SearchMatch {
  index: number;
  length: number;
}
