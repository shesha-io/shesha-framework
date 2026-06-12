import React from 'react';
import { BasicConfig, SelectFieldSettings, TextWidget } from '@react-awesome-query-builder/antd';
import { SpecificationConditionEditor } from './specificationConditionEditor';

type SpecificationWidgetType = TextWidget & SelectFieldSettings;
const SpecificationWidget: SpecificationWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'specification',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <SpecificationConditionEditor
        value={value ?? ""}
        onChange={(value) => {
          setValue(value);
        }}
      />
    );
  },
};

export { SpecificationWidget };
