import React, { FC, lazy } from 'react';
import { ICodeEditorProps } from './models';
import { withEnvironment } from './hocs/withEnvironment';
import { CodeEditorLoadingProgressor } from './loadingProgressor';

const CodeEditorNoSsr = lazy(() => import('./client-side/codeEditorClientSide'));

const CodeEditorInternal: FC<ICodeEditorProps> = (props) => {
  const isSSR = typeof window === 'undefined';
  return isSSR ? (
    <CodeEditorLoadingProgressor />
  ) : (
    <React.Suspense fallback={<CodeEditorLoadingProgressor />}>
      <CodeEditorNoSsr {...props} />
    </React.Suspense>
  );
};

/**
 * Renders a CodeEditor component for the given ICodeEditorProps.
 *
 * @param {ICodeEditorProps} props - the props for the CodeEditor component
 * @return {ReactElement} The rendered CodeEditor component
 */
export const CodeEditor = withEnvironment<ICodeEditorProps>(CodeEditorInternal);
