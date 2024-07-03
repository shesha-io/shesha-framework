import { Skeleton } from 'antd';
import React, { FC, lazy } from 'react';
import { ICodeEditorProps } from './models';
import { withAvailableConstants } from './hocs/withAvailableConstatns';

const CodeEditorNoSsr = lazy(() => import('./client-side/codeEditorClientSide'));

const CodeEditorInternal: FC<ICodeEditorProps> = (props) => {
    const isSSR = typeof window === 'undefined';
    return isSSR ? (
        <Skeleton loading={true} />
    ) : (
        <React.Suspense fallback={<div>Loading editor...</div>}>
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
export const CodeEditor = withAvailableConstants<ICodeEditorProps>(CodeEditorInternal);