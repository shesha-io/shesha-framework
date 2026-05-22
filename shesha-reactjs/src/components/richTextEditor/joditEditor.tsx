import React, { FC, lazy, useMemo, useState, useEffect } from 'react';
import { Skeleton } from 'antd';
import DOMPurify from 'dompurify';

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

  const sanitizedValue = useMemo(
    () => (typeof value === 'string' ? DOMPurify.sanitize(value, { USE_PROFILES: { html: true } }) : value),
    [value],
  );

  const getPlaceholder = (text: string): string | undefined => {
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

  const updateConfig = (newConfig: any): void => {
    setFullConfig({ ...defaultOptions, ...newConfig, placeholder: fullConfig.placeholder });
  };

  useEffect(() => {
    updateConfig(config);
  }, [config]);

  const handleBlur = (newValue: string): void => {
    const cleanValue = typeof newValue === 'string'
      ? DOMPurify.sanitize(newValue, { USE_PROFILES: { html: true } })
      : newValue;
    onChange?.(cleanValue);
  };

  const handleChange = (newValue: string): void => {
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
        value={sanitizedValue}
        config={fullConfig}
        onBlur={handleBlur} // preferred to use only this option to update the content for performance reasons
        onChange={handleChange}
      />
    </React.Suspense>
  );
};

export default JoditEditorWrapper;
