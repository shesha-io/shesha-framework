import React from 'react';
import { IToolboxComponent } from '../../../../../../interfaces';
import { GroupOutlined } from '@ant-design/icons';
import ButtonGroupSettingsModal from '../buttonGroupSettingsModal';
import { buttonsSettingsForm } from './settings';
import ConfigurableFormItem from '../../../formItem';
import { useForm } from '../../../../../..';
import { IButtonsProps as IButtonsComponentProps } from './interfaces';

const ButtonsComponent: IToolboxComponent<IButtonsComponentProps> = {
  type: 'buttons',
  name: 'Buttons',
  icon: <GroupOutlined />,
  isHidden: true,
  factory: (model: IButtonsComponentProps) => {
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

//#region Page Toolbar
