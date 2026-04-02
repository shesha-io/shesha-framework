import fs from 'fs';

export function warningHandlerPlugin(options = {}) {
  const {
    logFile = 'rollup-warnings.log',
    logLevel = 'all',
    timestampFormat = 'iso',
    maxFileSize = 1048576,
    backupOldLogs = true,
    removeOldLogs = true
  } = options;

  let logStream;

  // All internal methods as pure functions
  const utils = {
    getTimestamp() {
      switch (timestampFormat) {
        case 'iso':
          return new Date().toISOString();
        case 'locale':
          return new Date().toLocaleString();
        case 'unix':
          return Date.now().toString();
        default:
          return new Date().toISOString();
      }
    },

    getWarningSeverity(code) {
      const errorCodes = []; //['UNRESOLVED_IMPORT', 'MISSING_EXPORT', 'INVALID_IMPORT'];
      const warningCodes = ['CIRCULAR_DEPENDENCY']; //['CIRCULAR_DEPENDENCY', 'UNUSED_EXTERNAL_IMPORT', 'EMPTY_BUNDLE'];

      if (errorCodes.includes(code)) return 'error';
      if (warningCodes.includes(code)) return 'warning';
      return 'info';
    },

    getSeverityEmoji(severity) {
      const emojis = {
        error: '🚨',
        warning: '⚠️',
        info: 'ℹ️',
        debug: '🐛'
      };
      return emojis[severity] || '📝';
    },

    shouldLogWarning(warning) {
      switch (logLevel) {
        case 'all':
          return true;
        case 'errors-only':
          return utils.getWarningSeverity(warning.code) === 'error';
        case 'warnings-only':
          const severity = utils.getWarningSeverity(warning.code);
          return severity === 'warning' || severity === 'error';
        case 'none':
          return false;
        default:
          return true;
      }
    },

    formatLogEntry(warning, timestamp) {
      const severity = utils.getWarningSeverity(warning.code);
      const emoji = utils.getSeverityEmoji(severity);

      return `
[${timestamp}] ${emoji} [${severity.toUpperCase()}] ${warning.code || 'CUSTOM'}
📍 Location: ${warning.id || 'Unknown'}
📝 Message: ${warning.message}
${warning.frame ? `📋 Code:\n${warning.frame}\n` : ''}
${warning.plugin ? `🔌 Plugin: ${warning.plugin}` : ''}
${warning.hook ? `🪝 Hook: ${warning.hook}` : ''}
${warning.pos ? `📍 Position: ${warning.pos}` : ''}
────────────────────────────────────────────────────────────────────
`;
    }
  };

  // Internal methods that work with the module's state
  const internal = {
    initializeLogFile() {
      try {
        // Check if log file exists and needs rotation
        if (fs.existsSync(logFile)) {
          if (removeOldLogs){
            fs.rmSync(logFile);
          } else {
            const stats = fs.statSync(logFile);
            if (stats.size > maxFileSize && backupOldLogs) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const backupFile = `${logFile}.${timestamp}.bak`;
              fs.renameSync(logFile, backupFile);
              internal.writeLog(`Log file rotated: ${backupFile}`, 'info');
            }
          }
        }

        // Create log stream for efficient writing
        logStream = fs.createWriteStream(logFile, { flags: 'a' });

        // Write header
        const header = `
╔══════════════════════════════════════════════════════════════╗
║                   ROLLUP BUILD WARNINGS LOG                  ║
║                    Started: ${utils.getTimestamp()}            ║
╚══════════════════════════════════════════════════════════════╝

`;
        logStream.write(header);

      } catch (error) {
        console.error('Failed to initialize log file:', error);
      }
    },

    writeLog(message, level = 'info') {
      const timestamp = utils.getTimestamp();
      const emoji = utils.getSeverityEmoji(level);
      const logEntry = `[${timestamp}] ${emoji} ${message}\n`;

      internal.writeToStream(logEntry);
    },

    writeToStream(content) {
      if (logStream && !logStream.destroyed) {
        logStream.write(content);
      } else {
        // Fallback to sync write if stream is not available
        try {
          fs.appendFileSync(logFile, content);
        } catch (error) {
          console.error('Failed to write to log file:', error);
        }
      }
    },

    logWarningToFile(warning) {
      const timestamp = utils.getTimestamp();
      const logEntry = utils.formatLogEntry(warning, timestamp);
      internal.writeToStream(logEntry);
    },

    cleanupLogStream() {
      if (logStream) {
        logStream.end('\n╔══════════════════════════════════════════════════════════════╗\n║                       LOG SESSION ENDED                      ║\n╚══════════════════════════════════════════════════════════════╝\n\n');
        logStream = null;
      }
    },

    handleWarning(warning) {
      const shouldLog = utils.shouldLogWarning(warning);

      if (shouldLog) {
        internal.logWarningToFile(warning);
      }

      // Filter out specific warnings
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // Suppress circular dependency warnings but still log them
        internal.writeLog(`Suppressed circular dependency: ${warning.message}`, 'debug');
        return;
      }

      // Enhance specific warnings
      if (warning.code === 'UNRESOLVED_IMPORT') {
        warning.message = `🚨 Unresolved import: ${warning.message}`;
      }

      if (warning.code === 'MISSING_EXPORT') {
        warning.message = `📦 Missing export: ${warning.message}`;
        warning.toString = () => warning.message;
      }
    }
  };

  return {
    name: 'warning-handler',

    onLog(level, log) {
      if (level === 'warn') {
        internal.handleWarning(log);
      }
    },

    buildStart(buildOptions) {
      internal.initializeLogFile();

      internal.writeLog('🚀 Build started', 'info');
    },

    buildEnd() {
      internal.writeLog('🏁 Build completed', 'info');
      internal.cleanupLogStream();
    },

    closeBundle() {
      internal.writeLog('📦 Bundle closed', 'info');
      internal.cleanupLogStream();
    }
  };
}