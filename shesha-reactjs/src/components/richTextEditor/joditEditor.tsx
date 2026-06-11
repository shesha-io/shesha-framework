import React, { FC, lazy } from 'react';
import { Skeleton } from 'antd';
import { JoditEditorProps } from "jodit-react";

export type JoditConfig = JoditEditorProps["config"];

const JoditEditor = lazy(async () => {
  await import("jodit");
  const joditReact = await import('jodit-react');
  // temporary disable ace editor because of conflicts with code editor
  joditReact.Jodit.defaultOptions.sourceEditor = 'area';

  return joditReact;
});

export interface IJoditEditorProps {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  config?: JoditConfig | undefined;
}

export const JoditEditorWrapper: FC<IJoditEditorProps> = (props) => {
  const { config, value, onChange } = props;

  const handleBlur = (newValue: string): void => {
    onChange?.(newValue);
  };

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <React.Suspense fallback={<div>Loading editor...</div>}>
      <JoditEditor
        value={value ?? ""}
        {...(config ? { config } : {})}
        onBlur={handleBlur} // preferred to use only this option to update the content for performance reasons
      />
    </React.Suspense>
  );
};

export default JoditEditorWrapper;
