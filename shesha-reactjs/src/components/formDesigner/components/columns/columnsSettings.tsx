import React, { FC } from 'react';
import { Checkbox, Input, InputNumber } from 'antd';
import { IColumnsComponentProps } from './interfaces';
import ColumnsList from './columnsList';
import { EXPOSED_VARIABLES } from './exposedVariables';
import CodeEditor from '../codeEditor/codeEditor';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';

export const ColumnsSettingsForm: FC<ISettingsFormFactoryArgs<IColumnsComponentProps>> = (props) =>
  SettingsForm<IColumnsComponentProps>({ ...props, children: <ColumnsSettings {...props} /> });

const ColumnsSettings: FC<ISettingsFormFactoryArgs<IColumnsComponentProps>> = ({ readOnly }) => {
  return (
    <>
      <SettingsFormItem name="componentName" label="Component Name" required>
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="gutterX" label="Gutter X" jsSetting>
        <InputNumber min={1} max={48} step={4} readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="gutterY" label="Gutter Y" jsSetting>
        <InputNumber min={1} max={48} step={4} readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="columns" label="Columns">
        <ColumnsList readOnly={readOnly} />
      </SettingsFormItem>

      <SectionSeparator title="Style" />

      <SettingsFormItem name="style" label="Style">
        <CodeEditor
          propertyName="style"
          readOnly={readOnly}
          mode="dialog"
          label="Style"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          description="A script that returns the style of the element as an object. This should conform to CSSProperties"
          exposedVariables={EXPOSED_VARIABLES}
        />
      </SettingsFormItem>

      <SettingsFormItem name="stylingBox">
        <StyleBox />
      </SettingsFormItem>
    </>
  );
};
