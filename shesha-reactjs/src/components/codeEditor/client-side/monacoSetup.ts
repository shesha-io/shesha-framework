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

  // Import Environment type for proper typing
  type Environment = import('monaco-editor').Environment;

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
  const environment: Environment = {
    getWorker: function (_moduleId: string, label: string) {
      // Monaco's ESM workers must be loaded as module workers
      return new Worker(getWorkerUrl(label), { type: 'module' });
    },
    // Keep getWorkerUrl for compatibility with older loader code paths
    getWorkerUrl: function (_moduleId: string, label: string) {
      return getWorkerUrl(label);
    },
    // Disable trusted types policy to avoid CSP issues in some environments
    createTrustedTypesPolicy: undefined,
  };

  // Assign to global self
  (self as typeof globalThis & { MonacoEnvironment?: Environment }).MonacoEnvironment = environment;
}

// Export monaco with proper type - undefined during SSR, initialized on client
export default monaco;
