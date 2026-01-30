import { CSSProperties, FC, memo, useCallback } from "react";
import { LogLine } from "./interfaces";
import React from "react";
import { TimelineIndicator } from "./timelineIndicator";
import { LogLevel } from "@/providers/processMonitor/interfaces";
import { useStyles } from "./styles";
import { cx } from "antd-style";
import { BugOutlined, CheckCircleOutlined, CloseCircleOutlined, CodeOutlined, FolderOutlined, InfoCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { purple } from '@ant-design/colors';

// Log line props
export interface LogLineProps {
    log: LogLine;
    index: number;
    style: CSSProperties;
    isExpanded?: boolean;
    onToggleExpand?: (index: number) => void;
    searchMatches?: RegExpMatchArray[];
    onClick?: (log: LogLine, index: number) => void;
}

export const LogLineComponent: FC<LogLineProps> = memo(({
    log,
    index,
    style,
    //isExpanded,
    onToggleExpand,
    searchMatches = [],
    onClick,
}) => {
    const { styles, theme } = useStyles();
    const { level, message, isTimeline, hasChildren, collapsed, duration, taskName } = log;

    const getLineStyles = (): string => {
        const baseStyles = [styles.logLine, styles.logLineHover];

        switch (level) {
            case LogLevel.ERROR: baseStyles.push(styles.logLineError); break;
            case LogLevel.WARNING: baseStyles.push(styles.logLineWarning); break;
            case LogLevel.SUCCESS: baseStyles.push(styles.logLineSuccess); break;
            case LogLevel.SECTION: baseStyles.push(styles.logLineSection); break;
        }

        return cx(...baseStyles);
    };

    const getTextColor = (): string => {
        switch (level) {
            case LogLevel.ERROR: return theme.colorError;
            case LogLevel.WARNING: return theme.colorWarning;
            case LogLevel.SUCCESS: return theme.colorSuccess;
            case LogLevel.SECTION: return theme.colorInfo;
            case LogLevel.COMMAND: return theme.colorPrimary;
            case LogLevel.DEBUG: return purple.primary;
            default: return theme.colorText;
        }
    };

    const getIcon = () => {
        switch (level) {
            case LogLevel.ERROR: return <CloseCircleOutlined />;
            case LogLevel.WARNING: return <WarningOutlined />;
            case LogLevel.SUCCESS: return <CheckCircleOutlined />;
            case LogLevel.SECTION: return <InfoCircleOutlined />;
            case LogLevel.GROUP: return <FolderOutlined />;
            case LogLevel.COMMAND: return <CodeOutlined />;
            case LogLevel.DEBUG: return <BugOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const renderMessage = (): React.ReactNode => {
        if (!searchMatches || searchMatches.length === 0) {
            return message;
        }

        let lastIndex = 0;
        const segments: React.ReactNode[] = [];

        searchMatches.forEach((match, i) => {
            if (match.index !== undefined && match.index > lastIndex) {
                segments.push(message.substring(lastIndex, match.index));
            }
            if (match.index !== undefined) {
                segments.push(
                    <mark key={`${match.index}-${i}`} className={styles.searchHighlight}>
                        {message.substring(match.index, match.index + match[0].length)}
                    </mark>
                );
                lastIndex = match.index + match[0].length;
            }
        });

        if (lastIndex < message.length) {
            segments.push(message.substring(lastIndex));
        }

        return segments;
    };

    const handleClick = useCallback(() => {
        if (onClick) {
            onClick(log, index);
        }
    }, [log, index, onClick]);

    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleExpand) {
            onToggleExpand(index);
        }
    }, [index, onToggleExpand]);

    const textColor = getTextColor();

    return (
        <div
            style={{
                ...style,
                borderLeft: isTimeline ? `3px solid ${textColor}` : 'none',
                paddingLeft: isTimeline ? '12px' : '15px',
                cursor: onClick ? 'pointer' : 'default'
            }}
            className={getLineStyles()}
            data-level={level}
            data-index={index}
            onClick={handleClick}
            role="row"
        >
            <div className={styles.logLineContent}>
                {/* Line number */}
                <div className={styles.lineNumber}>
                    {String(index + 1).padStart(6, '0')}
                </div>

                {/* Timeline indicator for sections */}
                {isTimeline && (
                    <TimelineIndicator
                        level={level}
                        isStart={message.includes('Starting:')}
                        isEnd={message.includes('Finishing:')}
                        duration={duration}
                    />
                )}

                {/* Expand/collapse button for groups */}
                {hasChildren && (
                    <button
                        className={styles.expandToggle}
                        onClick={handleToggleExpand}
                        aria-label={collapsed ? 'Expand section' : 'Collapse section'}
                        type="button"
                    >
                        {collapsed ? '▶' : '▼'}
                    </button>
                )}

                <div className={styles.logIcon} style={{ color: textColor }}>
                    {getIcon()}
                </div>

                {/* Log message */}
                <div className={styles.logMessage} style={{ color: textColor }}>
                    {taskName && (
                        <span className={styles.taskName}>{taskName}: </span>
                    )}
                    <span className="message-text">{renderMessage()}</span>

                    {duration !== undefined && (
                        <span className={styles.durationBadge}>
                            {duration}ms
                        </span>
                    )}
                </div>

                {/* Timestamp */}
                <div className={styles.logTimestamp}>
                    {log.timeStamp ? log.timeStamp.format('HH:mm:ss') : '--:--:--'}
                </div>
            </div>
        </div>
    );
});
