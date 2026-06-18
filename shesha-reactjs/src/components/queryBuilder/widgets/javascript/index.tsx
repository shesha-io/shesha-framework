import React from 'react';
import { TextFieldSettings, TextWidget } from '@react-awesome-query-builder/antd';
import { JavaScriptEditor } from './javaScriptEditor';

type JavaScriptWidgetType = TextWidget & TextFieldSettings;
const JavaScriptWidget: JavaScriptWidgetType = {
  type: 'javascript',
  jsType: 'string',
  valueSrc: 'value',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <JavaScriptEditor
        value={value ?? ""}
        onChange={(value) => {
          setValue(value);
        }}
      />
    );
  },
};

export { JavaScriptWidget };
