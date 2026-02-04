/**
 * Monaco Editor Setup for Local Bundling
 *
 * This file configures Monaco Editor to use locally bundled files
 * instead of loading from a CDN.
 *
 * Worker files are copied from consuming app's monaco-editor package
 * to public/monaco/ during npm install via postinstall script.
 */

// Only import monaco on client side to avoid SSR issues
let monaco: typeof import('monaco-editor') | undefined;

if (typeof window !== 'undefined') {
  // Dynamic import only on client side
  monaco = require('monaco-editor');

  const basePath = '/monaco/vs';
  const getWorkerUrl = (label: string): string => {
    // All workers are loaded from the public/monaco directory
    // which is populated during npm install via postinstall script
    if (label === 'typescript' || label === 'javascript') {
      return `${basePath}/language/typescript/ts.worker.js`;
    }
    if (label === 'json') {
      return `${basePath}/language/json/json.worker.js`;
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return `${basePath}/language/css/css.worker.js`;
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return `${basePath}/language/html/html.worker.js`;
    }

    // Default editor worker
    return `${basePath}/editor/editor.worker.js`;
  };

  // Configure Monaco environment for web workers
  (self as any).MonacoEnvironment = {
    getWorker: function (_moduleId: string, label: string) {
      // Monaco's ESM workers must be loaded as module workers
      return new Worker(getWorkerUrl(label), { type: 'module' });
    },
    // Keep getWorkerUrl for compatibility with older loader code paths
    getWorkerUrl: function (_moduleId: string, label: string) {
      return getWorkerUrl(label);
    },
    // Provide a custom getWorker function to have more control over worker creation
    // This helps suppress errors from Monaco's internal loadForeignModule calls
    createTrustedTypesPolicy: undefined, // Disable trusted types to avoid CSP issues
  };

  // Suppress Monaco's "Unexpected usage" error from loadForeignModule
  // This error occurs when Monaco's TypeScript service tries to dynamically
  // load TypeScript library files, which isn't supported in our worker setup.
  // The error is non-critical and doesn't affect editor functionality.
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args: unknown[]) {
    // Check both string messages and Error objects
    const firstArg = args[0];
    let message = '';

    if (firstArg instanceof Error) {
      message = firstArg.message + ' ' + (firstArg.stack || '');
    } else if (typeof firstArg === 'string') {
      message = firstArg;
    } else {
      message = String(firstArg);
    }

    // Suppress Monaco's loadForeignModule errors
    if (message.includes('Unexpected usage') ||
      message.includes('loadForeignModule') ||
      message.includes('Could not create web worker') ||
      (firstArg instanceof Error && firstArg.message === 'Unexpected usage')) {
      // Suppress this specific Monaco error
      return;
    }

    originalError.apply(console, args);
  };

  console.warn = function (...args: unknown[]) {
    const firstArg = args[0];
    let message = '';

    if (firstArg instanceof Error) {
      message = firstArg.message + ' ' + (firstArg.stack || '');
    } else if (typeof firstArg === 'string') {
      message = firstArg;
    } else {
      message = String(firstArg);
    }

    // Suppress Monaco's loadForeignModule warnings
    if (message.includes('Unexpected usage') ||
      message.includes('loadForeignModule')) {
      return;
    }

    originalWarn.apply(console, args);
  };
}

// Export monaco with proper type - undefined during SSR, initialized on client
export default monaco;
