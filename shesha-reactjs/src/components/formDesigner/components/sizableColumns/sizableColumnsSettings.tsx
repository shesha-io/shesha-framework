import CodeEditor from '../codeEditor/codeEditor';
import React, { FC } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import SizableColumnsList from './sizableColumnList';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input } from 'antd';
import { EXPOSED_VARIABLES } from './exposedVariables';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { ISizableColumnComponentProps } from './interfaces';

const SizableColumnsSettings = ({ readOnly }: ISettingsFormFactoryArgs<ISizableColumnComponentProps>) => {
  return (
    <>
      <SettingsFormItem label="Component name" name="componentName" required={true}>
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem label="Hidden" name="hidden" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem label="Columns" name="columns">
        <SizableColumnsList readOnly={readOnly} />
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

export const SizableColumnsSettingsForm: FC<ISettingsFormFactoryArgs<ISizableColumnComponentProps>> = (props) => {
  return SettingsForm<ISizableColumnComponentProps>({ ...props, children: <SizableColumnsSettings {...props} /> });
};