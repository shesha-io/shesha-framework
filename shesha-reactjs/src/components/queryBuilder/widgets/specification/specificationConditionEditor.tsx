import React, { FC, useEffect } from 'react';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';

interface SpecificationConditionEditorProps {
  value?: string;
  onChange: (newValue?: string) => void;
}
export const SpecificationConditionEditor: FC<SpecificationConditionEditorProps> = ({ value, onChange }) => {
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
      label="Specification: condition to apply"
      description="Enter a condition that determines whether the Specification should be applied or not. Return true to apply the Specification or false to ignore it."
    />
  );
};
