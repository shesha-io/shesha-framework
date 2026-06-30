import React, { FC, useEffect } from 'react';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import { isDefined } from '@/utils/nullables';

interface JavaScriptEditorProps {
  value?: string;
  onChange: (newValue: string | null) => void;
}
export const JavaScriptEditor: FC<JavaScriptEditorProps> = ({ value, onChange }) => {
  useEffect(() => {
    // default value to empty string to prevent auto removal of the rule
    if (!isDefined(value))
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
