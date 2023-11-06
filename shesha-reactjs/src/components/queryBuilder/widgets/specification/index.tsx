import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import React, { FC, useEffect } from 'react';
import { CodeEditor } from '../../../formDesigner/components/codeEditor/codeEditor';

export type SpecificationWidgetType = BaseWidget & SelectFieldSettings;
const SpecificationWidget: SpecificationWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'specification',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <SpecificationConditionEditor
        value={value}
        onChange={value => { 
          setValue(value); 
        }}
      />
    );
  },
};

interface SpecificationConditionEditorProps {
  value?: string;
  onChange: (newValue?: string) => void;
}
const SpecificationConditionEditor: FC<SpecificationConditionEditorProps> = ({ value, onChange }) => {

  useEffect(() => {
    // default value to empty string to prevent auto removal of the rule
    if (value === null || value === undefined)
      onChange('');
  });

  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      mode='dialog'
      propertyName={'specificationCondition'}
      label='Specification: condition to apply'
      description="Enter a condition that determines whether the Specification should be applied or not. Return true to apply the Specification or false to ignore it."
    />
  );
};

export default SpecificationWidget;
