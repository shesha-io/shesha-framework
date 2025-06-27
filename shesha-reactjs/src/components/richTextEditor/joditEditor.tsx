import React, { FC, lazy, useState, useEffect } from 'react';
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

export const JoditEditorWrapper: FC<IJoditEditorProps> = (props) => {
    const { config, value, onChange } = props;

    const getPlaceholder = (text: string) => {
        return !text ? config?.placeholder : "";
    };

    const [fullConfig, setFullConfig] = useState<any>(() => {
        const result = {
            ...defaultOptions,
            ...config,
            placeholder: getPlaceholder(value),
        };
        return result;
    });

    const updateConfig = (newConfig: any) => {
      setFullConfig({ ...defaultOptions, ...newConfig, placeholder: fullConfig.placeholder });
  };

  useEffect(() => {
    updateConfig(config);
  }, [config]);

    const handleBlur = (newValue: string) => {
        onChange?.(newValue);
    };

    const handleChange = (newValue: string) => {
        // Apply value to restore placeholder
        if (!newValue && !fullConfig.placeholder && config.placeholder)
            onChange?.(newValue);
    };

    const isSSR = typeof window === 'undefined';

    return isSSR ? (
        <Skeleton loading={true} />
    ) : (
        <React.Suspense fallback={<div>Loading editor...</div>}>
            <JoditEditor
                value={value}
                config={fullConfig}
                onBlur={handleBlur} // preferred to use only this option to update the content for performance reasons
                onChange={handleChange}
            />
        </React.Suspense>
    );
};

export default JoditEditorWrapper;