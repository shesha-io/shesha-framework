import React, { FC, useMemo, useState, lazy, useEffect } from 'react';
import { Skeleton } from 'antd';

let defaultOptions = {};
const JoditEditor = lazy(async () => {
    const jodit = await import("jodit");
    defaultOptions = jodit.Jodit.defaultOptions;

    // temporary disable ace editor because of conflicts with code editor
    defaultOptions['sourceEditor'] = 'area';

    return (await import('jodit-react') as any);
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
    const [localPlaceholder, setLocalPlaceholder] = useState<string>(config?.placeholder);

    const fullConfig = useMemo<any>(() => {
        if (state?.content !== undefined) {
            setLocalPlaceholder("");
        }
        const result = {
            ...defaultOptions,
            ...config
        };
        return result;
    }, [config, state?.content]);

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
                value={state.content || value}
                config={{ ...fullConfig, placeholder: localPlaceholder }}
                onBlur={handleChange} // preferred to use only this option to update the content for performance reasons
            />
        </React.Suspense>
    );
};

export default JoditEditorWrapper;
