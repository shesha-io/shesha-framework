import { editor } from 'monaco-editor';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { ConsoleUsage, DiagnosticSeverity, ScriptDiagnostic, ScriptDiagnosticsSummary } from './models';

export const markerToDiagnostic = (marker: editor.IMarker): ScriptDiagnostic => {
  const code = typeof marker.code === 'string' ? marker.code : marker.code?.value;
  return {
    key: `${marker.owner}:${marker.startLineNumber}:${marker.startColumn}:${code ?? ''}:${marker.message}`,
    severity: marker.severity,
    message: marker.message,
    source: isNullOrWhiteSpace(code) ? marker.owner : `${marker.owner}(${code})`,
    lineNumber: marker.startLineNumber,
    column: marker.startColumn,
  };
};

export const sortDiagnostics = (diagnostics: ScriptDiagnostic[]): ScriptDiagnostic[] => {
  return [...diagnostics].sort((a, b) => a.lineNumber - b.lineNumber || a.column - b.column || b.severity - a.severity);
};

export const summariseDiagnostics = (diagnostics: ScriptDiagnostic[]): ScriptDiagnosticsSummary => {
  return diagnostics.reduce<ScriptDiagnosticsSummary>(
    (summary, diagnostic) => {
      if (diagnostic.severity === DiagnosticSeverity.error)
        return { ...summary, errors: summary.errors + 1 };
      if (diagnostic.severity === DiagnosticSeverity.warning)
        return { ...summary, warnings: summary.warnings + 1 };
      return { ...summary, infos: summary.infos + 1 };
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
};

const stringsAndCommentsRegExp = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*')|("(?:\\.|[^"\\\n])*")|(`(?:\\.|[^`\\])*`)/g;
const consoleUsageRegExp = /(?<![\w$.])console\s*\.\s*[A-Za-z_$][\w$]*/g;

const blankStringsAndComments = (code: string): string => {
  return code.replace(stringsAndCommentsRegExp, (match) => match.replace(/[^\n]/g, ' '));
};

export const findConsoleUsages = (code: string): ConsoleUsage[] => {
  const usages: ConsoleUsage[] = [];
  const lines = blankStringsAndComments(code).split('\n');
  lines.forEach((lineText, lineIndex) => {
    for (const match of lineText.matchAll(consoleUsageRegExp)) {
      usages.push({
        lineNumber: lineIndex + 1,
        column: match.index + 1,
        length: match[0].length,
      });
    }
  });
  return usages;
};
