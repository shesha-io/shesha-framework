/**
 * Monaco Editor Setup for Local Bundling
 *
 * This file configures Monaco Editor to use locally bundled files
 * instead of loading from a CDN, improving load times significantly.
 */

import * as monaco from 'monaco-editor';

// Configure Monaco environment for web workers
if (typeof window !== 'undefined') {
  // Use self.MonacoEnvironment to configure workers
  (self as any).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      // For TypeScript/JavaScript workers
      if (label === 'typescript' || label === 'javascript') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url),
          { type: 'module' },
        );
      }

      // For JSON workers
      if (label === 'json') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url),
          { type: 'module' },
        );
      }

      // For CSS workers
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url),
          { type: 'module' },
        );
      }

      // For HTML workers
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url),
          { type: 'module' },
        );
      }

      // Default editor worker
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
        { type: 'module' },
      );
    },
  };
}

export default monaco;
