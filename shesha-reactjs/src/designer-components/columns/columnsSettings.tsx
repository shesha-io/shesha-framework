import { CodeEditor } from '../codeEditor/codeEditor';
import ColumnsList from './columnsList';
import React, { FC } from 'react';
import SectionSeparator from '@/components/sectionSeparator';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import { Checkbox, Input, InputNumber } from 'antd';
import { EXPOSED_VARIABLES } from './exposedVariables';
import { IColumnsComponentProps } from './interfaces';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsCollapsiblePanel from '../_settings/settingsCollapsiblePanel';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

const ColumnsSettings: FC<ISettingsFormFactoryArgs<IColumnsComponentProps>> = (props) => {
  const { readOnly } = props;

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
          description="A script that returns the style of the element as an object. This should conform to CSSProperties"
          exposedVariables={EXPOSED_VARIABLES}
        />
      </SettingsFormItem>

      <SettingsFormItem name="stylingBox">
        <StyleBox />
      </SettingsFormItem>

      <SettingsCollapsiblePanel header="Security">
        <SettingsFormItem
          jsSetting
          label="Permissions"
          name="permissions"
          initialValue={props.model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component"
        >
          <PermissionAutocomplete readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const ColumnsSettingsForm: FC<ISettingsFormFactoryArgs<IColumnsComponentProps>> = (props) =>
  SettingsForm<IColumnsComponentProps>({ ...props, children: <ColumnsSettings {...props} /> });
