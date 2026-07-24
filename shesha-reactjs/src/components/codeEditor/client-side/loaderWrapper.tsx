/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import React, { useEffect, useState, ComponentType } from 'react';
import { ICodeEditorProps } from '../models';
import { firstNonEmptyString } from '@/utils/string';
import { Monaco, loader } from '@monaco-editor/react';
import { useMonacoLoaderSettings } from '../loaderProvider';
import { isCdnMonacoSettings, isLocalMonacoSettings } from '../loaderProvider/models';
import { IErrorInfo } from '@/interfaces';
import { makeErrorWithMessage } from '@/utils/errors';
import { CodeEditorLoadingProgressor } from '../loadingProgressor';

const importLocalMonacoAsync = async (basePath: string): Promise<Monaco> => {
  // Dynamic import only on client side
  const monaco = await import('monaco-editor');

  // Import Environment type for proper typing
  type Environment = import('monaco-editor').Environment;

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
    // createTrustedTypesPolicy: undefined,
  };

  // Assign to global self
  (self as typeof globalThis & { MonacoEnvironment?: Environment }).MonacoEnvironment = environment;


  return monaco;
};

type LoadingState = "waiting" | "loading" | "failed" | "ready";

/**
 * HOC that loads monaco-editor asynchronously and injects the editor instance
 * into the wrapped component.
 *
 * @param WrappedComponent - The component to wrap
 * @returns A component that provides monaco & editor props
 */
export function withMonaco<P extends ICodeEditorProps>(
  WrappedComponent: ComponentType<P>,
): React.FC<P> {
  // The returned component
  const WithMonacoWrapper: React.FC<P> = (props) => {
    const settings = useMonacoLoaderSettings();
    const [loadingState, setLoadingState] = useState<LoadingState>("waiting");
    const [loadingError, setLoadingError] = useState<IErrorInfo | null>(null);

    useEffect(() => {
      // Use a flag to ignore stale async responses
      let ignore = false;

      // async loader
      const loadMonacoAsync = async (): Promise<void> => {
        setLoadingState("loading");
        setLoadingError(null);
        try {
          if (isCdnMonacoSettings(settings)) {
            loader.config({ paths: { vs: settings.vsCdnUrl } });
            // Sync operation – no need for await
            if (!ignore) setLoadingState("ready");
          } else if (isLocalMonacoSettings(settings)) {
            const monaco = await importLocalMonacoAsync(settings.localPath);
            if (!ignore) {
              loader.config({ monaco });
              setLoadingState("ready");
            }
          }
        } catch (error) {
          if (!ignore) {
            setLoadingError(makeErrorWithMessage(error, 'Failed to load Monaco Editor'));
            setLoadingState("failed");
          }
        }
      };

      void loadMonacoAsync();

      // Cleanup: mark this effect as "stale" if a new effect runs
      return () => {
        ignore = true;
      };
    }, [settings]);

    return loadingState === "waiting"
      ? null
      : loadingState === "loading"
        ? <CodeEditorLoadingProgressor />
        : loadingState === "failed"
          ? <div>Error loading Monaco Editor: {loadingError?.message}</div>
          : <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  WithMonacoWrapper.displayName = `WithMonaco(${
    firstNonEmptyString(WrappedComponent.displayName, WrappedComponent.name, 'Component')
  })`;

  return WithMonacoWrapper;
}
