import { Skeleton } from 'antd';
import React, { FC, lazy } from 'react';
import { ICodeEditorProps } from './models';

const CodeEditorNoSsr = lazy(() => import('./monaco-local/codeEditorClientSide').then(module => ({ default: module.CodeEditorClientSide })));

/**
 * Renders a CodeEditor component for the given ICodeEditorProps.
 *
 * @param {ICodeEditorProps} props - the props for the CodeEditor component
 * @return {ReactElement} The rendered CodeEditor component
 */
export const CodeEditor: FC<ICodeEditorProps> = (props) => {
    const isSSR = typeof window === 'undefined';
    return isSSR ? (
        <Skeleton loading={true} />
    ) : (
        <React.Suspense fallback={<div>Loading editor...</div>}>
            <CodeEditorNoSsr {...props} />
        </React.Suspense>
    );
};