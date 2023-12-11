import { BaseWidget, BasicConfig, TextFieldSettings } from '@react-awesome-query-builder/antd';
import React, { FC, useEffect } from 'react';
import { CodeEditor } from '../../../formDesigner/components/codeEditor/codeEditor';

type JavaScriptWidgetType = BaseWidget & TextFieldSettings;
const JavaScriptWidget: JavaScriptWidgetType = {
  ...BasicConfig.widgets.text,
  type: 'javascript',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <JavaScriptEditor
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
const JavaScriptEditor: FC<SpecificationConditionEditorProps> = ({ value, onChange }) => {

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
      label='JavaScript Expression'
      description="Enter an JavaScript expression that returns true or false."
    />
  );
};

export { JavaScriptWidget };