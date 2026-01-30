import React from 'react';
import { type RowComponentProps } from "react-window";
import { LogLineComponent } from './logLine';
import { LogLine } from './interfaces';

export interface ILogRowProps {
    data: LogLine[];
    searchMatches: Record<number, RegExpMatchArray[]>;
    /** Callback when a log line is clicked */
    onClick?: (log: LogLine, index: number) => void;
    onToggleExpand?: (index: number) => void;
    expandedSections?: Set<number>;
}

export const LogRow = ({ index, style, data, searchMatches, onClick, onToggleExpand }: RowComponentProps<ILogRowProps>) => {

    const log = data[index];
    const matches = searchMatches[log.originalIndex!] || [];

    return (
        <LogLineComponent
            key={log.id}
            log={log}
            index={log.originalIndex!}
            style={style}
            //isExpanded={expandedSections.has(log.originalIndex!)}
            onToggleExpand={onToggleExpand}
            searchMatches={matches}
            onClick={onClick}
        />
    );
};
