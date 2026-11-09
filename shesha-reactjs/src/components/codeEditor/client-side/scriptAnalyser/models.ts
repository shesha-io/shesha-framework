export const DiagnosticSeverity = {
  hint: 1,
  info: 2,
  warning: 4,
  error: 8,
} as const;

export interface ScriptDiagnostic {
  key: string;
  severity: number;
  message: string;
  source: string;
  lineNumber: number;
  column: number;
}

export interface ScriptDiagnosticsSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export interface ConsoleUsage {
  lineNumber: number;
  column: number;
  length: number;
}
