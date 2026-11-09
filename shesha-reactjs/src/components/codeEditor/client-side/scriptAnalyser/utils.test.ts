import { editor } from 'monaco-editor';
import { DiagnosticSeverity, ScriptDiagnostic } from './models';
import { findConsoleUsages, markerToDiagnostic, sortDiagnostics, summariseDiagnostics } from './utils';

const makeDiagnostic = (values: Partial<ScriptDiagnostic>): ScriptDiagnostic => ({
  key: 'key',
  severity: DiagnosticSeverity.info,
  message: 'message',
  source: 'typescript',
  lineNumber: 1,
  column: 1,
  ...values,
});

describe('findConsoleUsages', () => {
  it('finds a console call with 1-based line and column', () => {
    const usages = findConsoleUsages('const x = 1;\n    console.log(x);');
    expect(usages).toEqual([{ lineNumber: 2, column: 5, length: 'console.log'.length }]);
  });

  it('finds multiple usages across lines', () => {
    const usages = findConsoleUsages('console.warn(1);\nconsole.error(2);');
    expect(usages).toHaveLength(2);
    expect(usages[0]).toMatchObject({ lineNumber: 1, column: 1 });
    expect(usages[1]).toMatchObject({ lineNumber: 2, column: 1 });
  });

  it('ignores console mentions inside strings', () => {
    expect(findConsoleUsages('const s = "console.log(1)";')).toEqual([]);
    expect(findConsoleUsages("const s = 'console.log(1)';")).toEqual([]);
    expect(findConsoleUsages('const s = `console.log(1)`;')).toEqual([]);
  });

  it('ignores console mentions inside comments', () => {
    expect(findConsoleUsages('// console.log(1)')).toEqual([]);
    expect(findConsoleUsages('/*\nconsole.log(1)\n*/')).toEqual([]);
  });

  it('ignores identifiers that merely contain console', () => {
    expect(findConsoleUsages('myconsole.log(1);')).toEqual([]);
    expect(findConsoleUsages('logger.console.log(1);')).toEqual([]);
  });

  it('keeps positions intact after blanked comments', () => {
    const usages = findConsoleUsages('/* a */ console.info(1);');
    expect(usages).toEqual([{ lineNumber: 1, column: 9, length: 'console.info'.length }]);
  });
});

describe('summariseDiagnostics', () => {
  it('counts errors and warnings separately and groups info with hints', () => {
    const summary = summariseDiagnostics([
      makeDiagnostic({ severity: DiagnosticSeverity.error }),
      makeDiagnostic({ severity: DiagnosticSeverity.warning }),
      makeDiagnostic({ severity: DiagnosticSeverity.info }),
      makeDiagnostic({ severity: DiagnosticSeverity.hint }),
    ]);
    expect(summary).toEqual({ errors: 1, warnings: 1, infos: 2 });
  });

  it('returns zeroes for an empty list', () => {
    expect(summariseDiagnostics([])).toEqual({ errors: 0, warnings: 0, infos: 0 });
  });
});

describe('sortDiagnostics', () => {
  it('orders by line, then column', () => {
    const sorted = sortDiagnostics([
      makeDiagnostic({ key: 'c', lineNumber: 14, column: 21 }),
      makeDiagnostic({ key: 'a', lineNumber: 2, column: 1 }),
      makeDiagnostic({ key: 'b', lineNumber: 14, column: 5 }),
    ]);
    expect(sorted.map((d) => d.key)).toEqual(['a', 'b', 'c']);
  });
});

describe('markerToDiagnostic', () => {
  const baseMarker = {
    owner: 'typescript',
    severity: DiagnosticSeverity.error,
    message: "Cannot find name 'nine'.",
    startLineNumber: 14,
    startColumn: 21,
    endLineNumber: 14,
    endColumn: 25,
  };

  it('formats the source as owner(code) for a string code', () => {
    const diagnostic = markerToDiagnostic({ ...baseMarker, code: '2304' } as editor.IMarker);
    expect(diagnostic.source).toBe('typescript(2304)');
    expect(diagnostic).toMatchObject({ lineNumber: 14, column: 21, severity: DiagnosticSeverity.error });
  });

  it('formats the source as owner(code) for an object code', () => {
    const diagnostic = markerToDiagnostic({ ...baseMarker, code: { value: '2304' } } as unknown as editor.IMarker);
    expect(diagnostic.source).toBe('typescript(2304)');
  });

  it('falls back to the owner when there is no code', () => {
    const diagnostic = markerToDiagnostic({ ...baseMarker, owner: 'no-console', code: undefined } as unknown as editor.IMarker);
    expect(diagnostic.source).toBe('no-console');
  });
});
