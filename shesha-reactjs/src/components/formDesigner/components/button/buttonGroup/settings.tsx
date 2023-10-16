import React, { FC } from 'react';
import { Select, Input, Checkbox } from 'antd';
import { IButtonGroupComponentProps } from './models';
import { ButtonGroupSettingsModal } from './buttonGroupSettingsModal';
import EditableTagGroup from '../../../../editableTagGroup';
import { ISettingsFormFactoryArgs } from 'interfaces';
import SettingsForm from 'designer-components/_settings/settingsForm';
import SettingsCollapsiblePanel from 'designer-components/_settings/settingsCollapsiblePanel';
import SettingsFormItem from 'designer-components/_settings/settingsFormItem';

const { Option } = Select;

export const ButtonGroupSettingsForm: FC<ISettingsFormFactoryArgs<IButtonGroupComponentProps>> = (props) => {
  return (
    SettingsForm<IButtonGroupComponentProps>({...props, children: <ButtonGroupSettings {...props}/>})
  );
};

const ButtonGroupSettings: FC<ISettingsFormFactoryArgs<IButtonGroupComponentProps>> = ({readOnly}) => {

  return (
    <>
      <SettingsCollapsiblePanel header='UX'>
        <SettingsFormItem name="componentName" label="Component name" required={true}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="size" label="Size" tooltip="This will set the size for all buttons"  jsSetting>
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

        <SettingsFormItem name="isInline" label="Is Button Inline" valuePropName="checked"  jsSetting>
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