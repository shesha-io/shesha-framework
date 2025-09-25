import React from 'react';
import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import { SpecificationConditionEditor } from './specificationConditionEditor';

type SpecificationWidgetType = BaseWidget & SelectFieldSettings;
const SpecificationWidget: SpecificationWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'specification',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <SpecificationConditionEditor
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      />
    );
  },
};

export { SpecificationWidget };
