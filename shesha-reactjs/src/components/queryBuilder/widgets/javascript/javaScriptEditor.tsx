import React, { FC, useEffect } from 'react';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';

interface JavaScriptEditorProps {
  value?: string;
  onChange: (newValue?: string) => void;
}
export const JavaScriptEditor: FC<JavaScriptEditorProps> = ({ value, onChange }) => {
  useEffect(() => {
    // default value to empty string to prevent auto removal of the rule
    if (value === null || value === undefined)
      onChange('');
  });

  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      mode="dialog"
      propertyName="specificationCondition"
      label="JavaScript Expression"
      description="Enter an JavaScript expression that returns true or false."
    />
  );
};
