import React from 'react';
import { BasicConfig } from '@react-awesome-query-builder/antd';
import type { BaseWidget, TextFieldSettings } from '@react-awesome-query-builder/antd';
import { Input } from 'antd';

type MustacheExpressionWidgetType = BaseWidget & TextFieldSettings;

export const MustacheExpressionWidget: MustacheExpressionWidgetType = {
  ...BasicConfig.widgets.text,
  valueSrc: 'value',
  factory: (props) => {
    return (
      <Input
        value={props.value ?? ''}
        onChange={(event) => props.setValue(event.target.value)}
        disabled={props.readonly}
        placeholder="Expression"
        className="sha-query-builder-mustache-expression-input"
      />
    );
  },
};
