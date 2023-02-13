import React from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../../interfaces';
import { GroupOutlined } from '@ant-design/icons';
import ButtonGroupSettingsModal, { IToolbarSettingsModal } from '../buttonGroupSettingsModal';
import { buttonsSettingsForm } from './settings';
import ConfigurableFormItem from '../../../formItem';
import { useForm } from '../../../../../..';

export interface IButtonsProps extends Omit<IToolbarSettingsModal, 'readOnly'>, IConfigurableFormComponent {}

const ButtonsComponent: IToolboxComponent<IButtonsProps> = {
  type: 'buttons',
  name: 'Buttons',
  icon: <GroupOutlined />,
  isHidden: true,
  factory: (model: IButtonsProps) => {
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
