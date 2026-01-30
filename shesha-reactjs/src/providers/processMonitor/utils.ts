import moment from "moment";
import { ILogEvent, LogLevel } from "./interfaces";

export const mergeSortedEvents = (sortedEvents1: ILogEvent[], sortedEvents2: ILogEvent[]): ILogEvent[] => {
  const result: ILogEvent[] = [];
  let i = 0, j = 0;
  
  // Merge like in merge sort (O(n))
  while (i < sortedEvents1.length && j < sortedEvents2.length) {
    const timeStamp1 = sortedEvents1[i].timeStamp;
    const timeStamp2 = sortedEvents2[j].timeStamp;
    
    if (!timeStamp1 || !timeStamp2) {
      // Handle null timestamps appropriately
      i++; j++;
      continue;
    }
    
    if (timeStamp1.valueOf() <= timeStamp2.valueOf()) {
      result.push(sortedEvents1[i++]);
    } else {
      result.push(sortedEvents2[j++]);
    }
  }
  
  // Add remaining events
  while (i < sortedEvents1.length) result.push(sortedEvents1[i++]);
  while (j < sortedEvents2.length) result.push(sortedEvents2[j++]);
  
  return result;
};

export const parseLogLevel = (level: string): LogLevel => {
  switch (level?.toLowerCase()) {
    case 'error':
      return LogLevel.ERROR;
    case 'fatal':
      return LogLevel.ERROR;
    case 'warning':
      return LogLevel.WARNING;
    case 'success':
      return LogLevel.SUCCESS;
    default:
      return LogLevel.INFO;
  }
};

/**
 * Parses a log4net log line with pattern: %-5level %utcdate %message%newline
 * @param {string} logLine - The log line to parse
 * @returns {object|null} Object with level, date, message properties or null if line doesn't match
 */
export const parseLog4NetLine = (logLine: string, id: string | number): ILogEvent | null => {
    // Trim any whitespace/newline characters
    const trimmedLine = logLine.trim();
    if (!trimmedLine) return null;
    
    // Regular expression to match the pattern
    // Breakdown:
    // ^ - start of line
    // (\w+) - capture the log level (DEBUG, INFO, WARN, ERROR, FATAL)
    // \s+ - whitespace separator
    // (\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3}) - capture date: YYYY-MM-DD HH:MM:SS,mmm
    // \s+ - whitespace separator
    // (.+) - capture the rest as message
    // $ - end of line
    const pattern = /^(\w+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s+(.+)$/;
    
    const match = trimmedLine.match(pattern);
    
    if (!match) {
        // Alternative pattern if log level has trailing spaces from %-5level
        const altPattern = /^(\w+)\s{1,2}(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s+(.+)$/;
        const altMatch = trimmedLine.match(altPattern);
        
        if (!altMatch) {
            console.warn('Line does not match expected log format:', trimmedLine);
            return null;
        }
        
        return {
            id,
            level: parseLogLevel(altMatch[1].trim()),
            timeStamp: moment(altMatch[2].replace(',', '.')),
            message: altMatch[3].trim()
        } satisfies ILogEvent;
    }
    
    return {
        id,
        level: parseLogLevel(match[1].trim()),
        timeStamp: moment(match[2].replace(',', '.')),
        message: match[3].trim()
    } satisfies ILogEvent;
};