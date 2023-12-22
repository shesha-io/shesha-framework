import ButtonGroupSettingsModal from '../buttonGroupSettingsModal';
import ConfigurableFormItem from '../../../formItem';
import React from 'react';
import { buttonsSettingsForm } from './settings';
import { GroupOutlined } from '@ant-design/icons';
import { IButtonsProps as IButtonsComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { useForm } from '@/providers';

const ButtonsComponent: IToolboxComponent<IButtonsComponentProps> = {
  type: 'buttons',
  name: 'Buttons',
  icon: <GroupOutlined />,
  isHidden: true,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    return (
      <ConfigurableFormItem model={model}>
        <ButtonGroupSettingsModal title="Configure Buttons" readOnly={ formMode === 'readonly' }/>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: buttonsSettingsForm,
};

export default ButtonsComponent;
