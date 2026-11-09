import { Monaco } from '@monaco-editor/react';
import { IDisposable, editor } from 'monaco-editor';
import { findConsoleUsages } from './utils';

export const NO_CONSOLE_OWNER = 'no-console';
const NO_CONSOLE_MESSAGE = 'Console output left in script';

export const registerNoConsoleAnalyser = (monaco: Monaco, model: editor.ITextModel): IDisposable => {
  const validate = (): void => {
    if (model.isDisposed())
      return;

    const markers = findConsoleUsages(model.getValue()).map<editor.IMarkerData>((usage) => ({
      severity: monaco.MarkerSeverity.Info,
      message: NO_CONSOLE_MESSAGE,
      startLineNumber: usage.lineNumber,
      startColumn: usage.column,
      endLineNumber: usage.lineNumber,
      endColumn: usage.column + usage.length,
    }));
    monaco.editor.setModelMarkers(model, NO_CONSOLE_OWNER, markers);
  };

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const subscription = model.onDidChangeContent(() => {
    clearTimeout(timeout);
    timeout = setTimeout(validate, 250);
  });
  validate();

  return {
    dispose: (): void => {
      clearTimeout(timeout);
      subscription.dispose();
      if (!model.isDisposed())
        monaco.editor.setModelMarkers(model, NO_CONSOLE_OWNER, []);
    },
  };
};
