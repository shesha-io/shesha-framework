import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import React, { useEffect } from 'react';
import { CodeEditor } from '../../../formDesigner/components/codeEditor/codeEditor';

export type SpecificationWidgetType = BaseWidget & SelectFieldSettings;
const SpecificationWidget: SpecificationWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'specification',
  factory: props => {
    const { value, setValue } = props;
    
    useEffect(() => {
      // default value to empty string to prevent auto removal of the rule
      if (value === null || value === undefined)
        setValue('');
    }, []);

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
