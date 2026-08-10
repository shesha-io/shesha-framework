import React, { ReactElement } from 'react';
import { type RowComponentProps } from "react-window";
import { LogLineComponent } from './logLine';
import { LogLine } from './interfaces';
import { isDefined } from '@/utils/nullables';

export interface ILogRowProps {
  data: LogLine[];
  searchMatches: Record<number, RegExpMatchArray[]>;
  /** Callback when a log line is clicked */
  onClick?: ((log: LogLine, index: number) => void) | undefined;
  onToggleExpand?: ((index: number) => void) | undefined;
  expandedSections?: Set<number> | undefined;
}

export const LogRow = ({ index, style, data, searchMatches, onClick, onToggleExpand }: RowComponentProps<ILogRowProps>): ReactElement | null => {
  const log = data[index];
  if (!isDefined(log))
    return null;

  const matches = searchMatches[log.originalIndex!] || [];

  return (
    <LogLineComponent
      key={log.id}
      log={log}
      index={log.originalIndex!}
      style={style}
      // isExpanded={expandedSections.has(log.originalIndex!)}
      onToggleExpand={onToggleExpand}
      searchMatches={matches}
      onClick={onClick}
    />
  );
};
