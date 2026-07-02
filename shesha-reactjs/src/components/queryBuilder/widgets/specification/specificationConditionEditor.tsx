import React, { FC, useEffect } from 'react';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import { isDefined } from '@/utils/nullables';

interface SpecificationConditionEditorProps {
  value?: string;
  onChange: (newValue: string | null) => void;
}
export const SpecificationConditionEditor: FC<SpecificationConditionEditorProps> = ({ value, onChange }) => {
  useEffect(() => {
    // default value to empty string to prevent auto removal of the rule.
    // Mount-only: this is initialisation, not a per-render concern. Without an
    // empty deps array the effect re-fires every render and, when the builder
    // doesn't persist '' as a defined value, loops onChange → setValue → render.
    if (!isDefined(value))
      onChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
