import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import React from 'react';
import { CodeEditor } from '../../../formDesigner/components/codeEditor/codeEditor';

export type SpecificationWidgetType = BaseWidget & SelectFieldSettings;
const SpecificationWidget: SpecificationWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'specification',
  factory: props => {
    const { /*fieldDefinition ,*/ value, setValue } = props;
    //const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;
    //console.log('custom settings', customSettings);

    return (
      <CodeEditor 
        value={value}
        onChange={setValue}
        mode='dialog' 
        propertyName={'specificationCondition'} 
        type={''} 
        id={''}
        label='Specification: condition to apply'
        description="Enter a condition that determines whether the Specification should be  applied or not. Return true to apply the Specification or false to ignore it."
      />
    );
  },
};

export default SpecificationWidget;
