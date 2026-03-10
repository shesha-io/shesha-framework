import React, {
  CSSProperties,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { List, useListRef, type ListProps } from 'react-window';
import { LogLine } from './interfaces';
import { LogRow } from './logRow';
import { LogLevel } from '@/providers/processMonitor/interfaces';
import { App, Button, Checkbox, Input, Spin } from 'antd';
import { useStyles } from './styles';
import { cx } from 'antd-style';
import { CopyOutlined, DownloadOutlined, DownOutlined, ExpandOutlined, LoadingOutlined, SearchOutlined, ShrinkOutlined, UpOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { purple } from '@ant-design/colors';

type OnListScroll = ListProps<object, "div">["onScroll"];

export interface LogViewerProps {
  /** Array of log objects */
  logs?: LogLine[];
  /** Raw log text to parse (alternative to logs array) */
  rawLogText?: string;
  /** Whether to automatically scroll to bottom */
  autoScroll?: boolean;
  /** Initial search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Whether logs are loading */
  isLoading?: boolean;
  /** Height of the log viewer */
  height?: number;
  /** Whether to follow new logs (auto-scroll) */
  follow?: boolean;
  /** Callback when download button is clicked */
  onDownload?: () => void;
  /** Callback when copy button is clicked */
  onCopy?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Callback when a log line is clicked */
  onLineClick?: (log: LogLine, index: number) => void;
  /** Maximum number of logs to keep in memory */
  maxLogs?: number;
  /** Whether to show the header */
  showHeader?: boolean;
}

export interface LogStatistics {
  total: number;
  errors: number;
  warnings: number;
  successes: number;
  sections: number;
  commands: number;
  debug: number;
}

// Parse Azure DevOps log format
const parseAzureLogLine = (line: string, index: number): LogLine => {
  // Azure DevOps log patterns
  const patterns: Record<string, RegExp> = {
    section: /^##\[section\](.*)/,
    group: /^##\[group\](.*)/,
    endgroup: /^##\[endgroup\]/,
    error: /^##\[error\](.*)/,
    warning: /^##\[warning\](.*)/,
    command: /^##\[command\](.*)/,
    debug: /^##\[debug\](.*)/,
    sectionEnd: /^##\[section\]\s*$/,
  };

  let level: LogLevel = LogLevel.INFO;
  let message = line;
  let isTimeline = false;
  let duration: number | undefined = undefined;
  let taskName: string | undefined = undefined;

  // Check for Azure DevOps specific patterns
  for (const [patternLevel, regex] of Object.entries(patterns)) {
    const match = line.match(regex);
    if (match) {
      level = patternLevel as LogLevel;
      message = match[1] || '';

      // Special handling for sections
      if (patternLevel === 'section' && message.includes('Starting:')) {
        isTimeline = true;
        taskName = message.replace('Starting:', '').trim();
      }
      if (patternLevel === 'section' && message.includes('Finishing:')) {
        isTimeline = true;
        taskName = message.replace('Finishing:', '').trim();
        const timeMatch = line.match(/\((\d+)ms\)$/);
        if (timeMatch) duration = parseInt(timeMatch[1], 10);
      }
      break;
    }
  }

  // Check for success patterns
  if (line.includes('succeeded') || line.includes('completed successfully')) {
    level = LogLevel.SUCCESS;
  }

  // Check for timeline markers
  if (line.includes('##[section]') || line.includes('##[group]')) {
    isTimeline = true;
  }

  return {
    id: index,
    raw: line,
    message,
    level,
    isTimeline,
    duration,
    taskName,
    hasChildren: level === LogLevel.GROUP || level === LogLevel.SECTION,
    collapsed: false,
    originalIndex: index,
  };
};

// Main Azure DevOps Log Viewer Component
export const LogViewer: FC<LogViewerProps> = ({
  logs = [],
  rawLogText = '',
  autoScroll = true,
  searchQuery = '',
  onSearchChange,
  isLoading = false,
  height = 700,
  follow = true,
  onDownload,
  onCopy,
  className = '',
  onLineClick,
  maxLogs = 10000,
  showHeader = true,
}) => {
  const { message } = App.useApp();
  const { styles, theme } = useStyles();
  const listRef = useListRef();
  const listRefCurrent = listRef.current;
  const scrollToRow = listRefCurrent?.scrollToRow;

  const [processedLogs, setProcessedLogs] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([
    LogLevel.INFO, LogLevel.ERROR, LogLevel.WARNING,
    LogLevel.SUCCESS, LogLevel.SECTION, LogLevel.COMMAND,
  ]);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(autoScroll);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [searchMatches, setSearchMatches] = useState<Record<number, RegExpMatchArray[]>>({});
  const [searchIndex, setSearchIndex] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [statistics, setStatistics] = useState<LogStatistics>({
    total: 0,
    errors: 0,
    warnings: 0,
    successes: 0,
    sections: 0,
    commands: 0,
    debug: 0,
  });

  // Parse logs from raw text or processed array
  useEffect(() => {
    let parsedLogs: LogLine[] = [];

    if (rawLogText) {
      const lines = rawLogText.split('\n');
      parsedLogs = lines.map((line, index) => ({
        ...parseAzureLogLine(line, index),
        id: index,
        originalIndex: index,
      }));
    } else if (logs.length > 0) {
      parsedLogs = logs.map((log, index) => ({
        ...parseAzureLogLine(log.raw || log.message || '', index),
        ...log,
        id: log.id || index,
        originalIndex: index,
      }));
    }

    // Limit number of logs to prevent memory issues
    if (parsedLogs.length > maxLogs) {
      parsedLogs = parsedLogs.slice(-maxLogs);
    }

    setProcessedLogs(parsedLogs);

    // Update statistics
    const stats: LogStatistics = {
      total: parsedLogs.length,
      errors: parsedLogs.filter((l) => l.level === LogLevel.ERROR).length,
      warnings: parsedLogs.filter((l) => l.level === LogLevel.WARNING).length,
      successes: parsedLogs.filter((l) => l.level === LogLevel.SUCCESS).length,
      sections: parsedLogs.filter((l) => l.level === LogLevel.SECTION).length,
      commands: parsedLogs.filter((l) => l.level === LogLevel.COMMAND).length,
      debug: parsedLogs.filter((l) => l.level === LogLevel.DEBUG).length,
    };

    setStatistics(stats);
  }, [logs, rawLogText, maxLogs]);

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setSearchMatches({});
      setTotalMatches(0);
      setSearchIndex(0);
      return;
    }

    const matches: Record<number, RegExpMatchArray[]> = {};
    let matchCount = 0;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    processedLogs.forEach((log, index) => {
      const logMatches = [...log.message.matchAll(regex)];
      if (logMatches.length > 0) {
        matches[index] = logMatches;
        matchCount += logMatches.length;
      }
    });

    setSearchMatches(matches);
    setTotalMatches(matchCount);
    setSearchIndex(0);
  }, [searchTerm, processedLogs]);

  // Filter logs based on selected levels and expanded sections
  const filteredLogs = useMemo(() => {
    let result = processedLogs.filter((log) => selectedLevels.includes(log.level));

    // Handle collapsed sections
    const filtered: LogLine[] = [];
    let skipDepth = 0;

    for (let i = 0; i < result.length; i++) {
      const log = result[i];

      if (skipDepth > 0) {
        if (log.hasChildren) {
          skipDepth++;
        } else if (log.level === LogLevel.SECTION && log.message.includes('Finishing:')) {
          skipDepth--;
        }
        continue;
      }

      if (log.hasChildren && expandedSections.has(i)) {
        skipDepth = 1;
        continue;
      }

      filtered.push({
        ...log,
        displayIndex: filtered.length,
      });
    }

    return filtered;
  }, [processedLogs, selectedLevels, expandedSections]);

  // Auto-scroll to bottom
  const filteredLogsCount = filteredLogs.length;
  useEffect(() => {
    if (shouldAutoScroll && follow && scrollToRow && filteredLogsCount > 0) {
      scrollToRow({ index: filteredLogsCount - 1 });
    }
  }, [filteredLogsCount, shouldAutoScroll, follow, scrollToRow]);

  // Navigate to next/previous search result
  const navigateSearch = useCallback((direction: number) => {
    if (totalMatches === 0) return;

    const matchIndices = Object.keys(searchMatches).map(Number);
    let newIndex = searchIndex + direction;

    if (newIndex < 0) newIndex = totalMatches - 1;
    if (newIndex >= totalMatches) newIndex = 0;

    setSearchIndex(newIndex);

    // Find which log contains this match
    let cumulative = 0;
    for (const idx of matchIndices) {
      const matches = searchMatches[idx];
      if (newIndex < cumulative + matches.length) {
        scrollToRow?.({ index: idx });
        break;
      }
      cumulative += matches.length;
    }
  }, [searchMatches, totalMatches, searchIndex, scrollToRow]);

  // Toggle section expansion
  const toggleSection = useCallback((index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Toggle log level filter
  const toggleLevelFilter = useCallback((level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level],
    );
  }, []);

  // Handle scroll events
  const handleScroll = useCallback<OnListScroll>(() => {
    if (listRefCurrent) {
      const { element } = listRefCurrent;
      if (!element)
        return;
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      if (shouldAutoScroll !== isAtBottom) {
        setShouldAutoScroll(isAtBottom);
      }
    }
  }, [shouldAutoScroll, listRefCurrent]);

  // Copy logs to clipboard
  const handleCopy = useCallback(async () => {
    const text = filteredLogs.map((log) => log.raw).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      message.success('Logs copied to clipboard!');
      if (onCopy) onCopy();
    } catch (err) {
      message.error('Failed to copy logs');
      console.error('Failed to copy logs:', err);
    }
  }, [filteredLogs, onCopy, message]);

  // Download logs
  const handleDownload = useCallback(() => {
    const text = filteredLogs.map((log) => log.raw).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Logs downloaded!');
    if (onDownload) onDownload();
  }, [filteredLogs, onDownload, message]);

  // Expand/collapse all sections
  const toggleAllSections = useCallback((expand: boolean) => {
    if (expand) {
      const allSectionIndices = processedLogs
        .map((log, idx) => log.hasChildren ? idx : -1)
        .filter((idx) => idx !== -1);
      setExpandedSections(new Set(allSectionIndices));
    } else {
      setExpandedSections(new Set());
    }
  }, [processedLogs]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  }, [onSearchChange]);

  // Handle auto-scroll toggle
  const handleAutoScrollToggle = useCallback((e: CheckboxChangeEvent) => {
    setShouldAutoScroll(e.target.checked);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setShouldAutoScroll(true);
    scrollToRow({ index: filteredLogs.length - 1 });
  }, [filteredLogs.length, scrollToRow]);

  // Calculate which log levels are available
  const availableLevels = useMemo(() => {
    const levels = new Set<LogLevel>();
    processedLogs.forEach((log) => levels.add(log.level));
    return Array.from(levels);
  }, [processedLogs]);

  // Get level filter button style
  const getLevelFilterStyle = (level: LogLevel): CSSProperties => {
    const colorMap: Record<LogLevel, string> = {
      [LogLevel.INFO]: theme.colorText,
      [LogLevel.ERROR]: theme.colorError,
      [LogLevel.WARNING]: theme.colorWarning,
      [LogLevel.SUCCESS]: theme.colorSuccess,
      [LogLevel.SECTION]: theme.colorInfo,
      [LogLevel.GROUP]: theme.colorPrimary,
      [LogLevel.COMMAND]: theme.colorPrimary,
      [LogLevel.DEBUG]: purple.primary,
    };

    return {
      '--level-color': colorMap[level],
      "opacity": selectedLevels.includes(level) ? 1 : 0.3,
    } as CSSProperties;
  };

  return (
    <div className={cx(styles.container, className)}>
      {/* Header - Azure DevOps style */}
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.pipelineStatus}>
              <span className={cx(styles.statusIndicator, styles.statusIndicatorSuccess)}></span>
              <span className={styles.statusText}>Task completed</span>
            </div>
            <div className={styles.pipelineInfo}>
              <span className={styles.pipelineName}>
                Build #{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}.1
              </span>
              <span className={styles.pipelineTime}>Completed just now</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Button
              icon={<ExpandOutlined />}
              onClick={() => toggleAllSections(true)}
              size="small"
            >
              Expand all
            </Button>
            <Button
              icon={<ShrinkOutlined />}
              onClick={() => toggleAllSections(false)}
              size="small"
            >
              Collapse all
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              size="small"
              type="primary"
            >
              Download logs
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
              size="small"
            >
              Copy logs
            </Button>
          </div>
        </div>
      )}
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search in logs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
              prefix={<SearchOutlined />}
              variant="borderless"
              size="small"
            />
            {searchTerm && (
              <div className={styles.searchResults}>
                <span className={styles.matchCount}>{totalMatches} matches</span>
                <Button
                  icon={<UpOutlined />}
                  onClick={() => navigateSearch(-1)}
                  disabled={totalMatches === 0}
                  size="small"
                  type="text"
                />
                <Button
                  icon={<DownOutlined />}
                  onClick={() => navigateSearch(1)}
                  disabled={totalMatches === 0}
                  size="small"
                  type="text"
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.filterContainer}>
          <div className={styles.levelFilters}>
            {availableLevels.map((level) => (
              <Button
                key={level}
                className={cx(styles.levelFilter, selectedLevels.includes(level) && styles.levelFilterActive)}
                onClick={() => toggleLevelFilter(level)}
                style={getLevelFilterStyle(level)}
                size="small"
                type="text"
              >
                <span
                  className={styles.filterDot}
                  style={{ backgroundColor: `var(--level-color)` }}
                />
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className={styles.viewOptions}>
          <label className={styles.toggleOption}>
            <Checkbox
              checked={shouldAutoScroll}
              onChange={handleAutoScrollToggle}
            />
            <span>Follow logs</span>
          </label>
          {/* <label className={styles.toggleOption}>
                        <Checkbox
                            defaultChecked={showTimestamps}
                        />
                        <span>Show timestamps</span>
                    </label>
                    <label className={styles.toggleOption}>
                        <Checkbox
                            defaultChecked={showLineNumbers}
                        />
                        <span>Line numbers</span>
                    </label> */}
        </div>
      </div>

      {/* Log Statistics */}
      <div className={styles.statistics}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total lines</span>
            <span className={styles.statValue}>{statistics.total}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Errors</span>
            <span className={cx(styles.statValue, styles.statValueError)}>
              {statistics.errors}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Warnings</span>
            <span className={cx(styles.statValue, styles.statValueWarning)}>
              {statistics.warnings}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Sections</span>
            <span className={cx(styles.statValue, styles.statValueSuccess)}>
              {statistics.sections}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Displayed</span>
            <span className={styles.statValue}>{filteredLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Log Content */}
      <div
        className={cx(styles.contentContainer, styles.customScrollbar)}
        style={{ height: `${height}px` }}
      >
        {isLoading ? (
          <div className={styles.loadingState}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <span>Loading pipeline logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3 className={styles.emptyTitle}>No logs to display</h3>
            <p className={styles.emptyText}>Try adjusting your filters or check if logs are available.</p>
          </div>
        ) : (
          <List
            listRef={listRef}
            rowCount={filteredLogs.length}
            rowHeight={32}
            overscanCount={10}
            onScroll={handleScroll}
            rowComponent={LogRow}
            rowProps={{
              data: filteredLogs,
              searchMatches,
              onClick: onLineClick,
              onToggleExpand: toggleSection,
              expandedSections: expandedSections,
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {isLoading && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot}></span>
              Live updating...
            </div>
          )}
          <span className={styles.lineCount}>
            {filteredLogs.length} of {processedLogs.length} lines
          </span>
          {searchTerm && totalMatches > 0 && (
            <span className={styles.searchInfo}>
              • Match {searchIndex + 1} of {totalMatches}
            </span>
          )}
        </div>
        <div className={styles.footerRight}>
          <button
            className={styles.scrollToBottomBtn}
            onClick={scrollToBottom}
            disabled={shouldAutoScroll}
            type="button"
          >
            Scroll to bottom
          </button>
          <div className={styles.scrollPosition}>
            {shouldAutoScroll ? 'Following' : 'Paused'}
          </div>
        </div>
      </div>
    </div>
  );
};
