import EditableTagGroup from '@/components/editableTagGroup';
import React, { FC } from 'react';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { ButtonGroupSettingsModal } from './buttonGroupSettingsModal';
import { Checkbox, Input, Select } from 'antd';
import { IButtonGroupComponentProps } from './models';
import { ISettingsFormFactoryArgs } from '@/interfaces';

const { Option } = Select;

const ButtonGroupSettings: FC<ISettingsFormFactoryArgs<IButtonGroupComponentProps>> = ({ readOnly }) => {

  return (
    <>
      <SettingsCollapsiblePanel header='UX'>
        <SettingsFormItem name="componentName" label="Component name" required={true}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="size" label="Size" tooltip="This will set the size for all buttons" jsSetting>
          <Select disabled={readOnly}>
            <Option value="small">Small</Option>
            <Option value="middle">Middle</Option>
            <Option value="large">Large</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="spaceSize" label="Space size" tooltip="This will be the gap size between the buttons" jsSetting>
          <Select disabled={readOnly}>
            <Option value="small">Small</Option>
            <Option value="middle">Middle</Option>
            <Option value="large">Large</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
          <ReadOnlyModeSelector readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="isInline" label="Is Button Inline" valuePropName="checked" jsSetting>
          <Checkbox />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Customization'>
        <SettingsFormItem name="items">
          <ButtonGroupSettingsModal readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Security'>
        <SettingsFormItem
          label="Permissions"
          name="permissions"
          tooltip="Enter a list of permissions that should be associated with this component"
          jsSetting
        >
          <EditableTagGroup readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const ButtonGroupSettingsForm: FC<ISettingsFormFactoryArgs<IButtonGroupComponentProps>> = (props) => {
  return (
    SettingsForm<IButtonGroupComponentProps>({ ...props, children: <ButtonGroupSettings {...props} /> })
  );
};