import { FC, memo } from "react";
import React from "react";
import { LogLevel } from "@/providers/processMonitor/interfaces";
import { useStyles } from "./styles";

// Timeline indicator props
export interface TimelineIndicatorProps {
    level: LogLevel;
    isStart?: boolean;
    isEnd?: boolean;
    duration?: number;
}

// Timeline indicator component
export const TimelineIndicator: FC<TimelineIndicatorProps> = memo(({
    level,
    isStart = false,
    isEnd = false,
    duration
}) => {
    const { styles, theme } = useStyles();
    const getTimelineColor = (): string => {
        switch (level) {
            case LogLevel.ERROR: return theme.colorError;
            case LogLevel.WARNING: return theme.colorWarning;
            case LogLevel.SUCCESS: return theme.colorSuccess;
            case LogLevel.SECTION: return theme.colorInfo;
            default: return theme.colorPrimary;
        }
    };

    const color = getTimelineColor();

    return (
        <div className={styles.timelineIndicator}>
            <div
                className={styles.timelineLineTop}
                style={{
                    backgroundColor: isStart ? 'transparent' : color,
                    opacity: isStart ? 0 : 0.6
                }}
            />
            <div
                className={styles.timelineDot} 
                style={{
                    backgroundColor: color,
                    borderColor: color
                }}
            />
            <div
                className={styles.timelineLineBottom}
                style={{
                    backgroundColor: isEnd ? 'transparent' : color,
                    opacity: isEnd ? 0 : 0.6
                }}
            />
            {duration !== undefined && (
                <div className={styles.timelineDuration}>
                    {duration}ms
                </div>
            )}
        </div>
    );
});