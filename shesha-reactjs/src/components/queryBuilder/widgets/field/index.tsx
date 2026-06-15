import React from 'react';
import { BasicConfig } from '@react-awesome-query-builder/antd';
import type { FieldWidget as BaseFieldWidget } from '@react-awesome-query-builder/antd';
import { FieldWidgetProvider } from './fieldWidgetContext';

type FieldWidgetType = BaseFieldWidget & {
  valueSrc: "field";
};

type RceType = typeof React.createElement;

const FieldWidget: FieldWidgetType = {
  ...BasicConfig.widgets.field,
  // type: 'specification',
  factory: (props, configContext) => {
    if (configContext === undefined)
      throw new Error('configContext is undefined');

    const { W: { ValueFieldWidget } } = configContext;
    const RCE = "RCE" in configContext ? configContext["RCE"] as RceType : React.createElement;
    const fieldSelectorProps = {
      ...props,
      isFieldComparison: true,
      mainField: props.fieldDefinition,
    };

    return (
      <>
        <FieldWidgetProvider widgetProps={props}>
          {ValueFieldWidget && RCE(ValueFieldWidget, fieldSelectorProps)}
        </FieldWidgetProvider>
      </>
    );
  },
};

export { FieldWidget };
