import React, { FC, useMemo, useState, lazy } from 'react';
import { Skeleton } from 'antd';

let defaultOptions = {};
const JoditEditor = lazy(async () => {
    const jodit = await import("jodit");
    defaultOptions = jodit.Jodit.defaultOptions;

    return import('jodit-react');
});

export interface IJoditEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    config?: any;
}

interface IRichTextEditorState {
    content?: string;
}

export const JoditEditorWrapper: FC<IJoditEditorProps> = (props) => {
    const { config, value, onChange } = props;

    const [state, setState] = useState<IRichTextEditorState>({ content: value });

    const fullConfig = useMemo<any>(() => {
        const result = {
            ...defaultOptions,
            ...config
        };

        return result;
    }, [config]);

    const handleChange = (incomingValue: string) => {
        setState(prev => ({ ...prev, content: incomingValue }));

        if (onChange) {
            onChange(incomingValue);
        }
    };

    const isSSR = typeof window === 'undefined';

    return isSSR ? (
        <Skeleton loading={true} />
    ) : (
        <React.Suspense fallback={<div>Loading editor...</div>}>
            <JoditEditor
                value={state.content}
                config={fullConfig}
                onBlur={handleChange} // preferred to use only this option to update the content for performance reasons
            />
        </React.Suspense>
    );
}

export default JoditEditorWrapper;
