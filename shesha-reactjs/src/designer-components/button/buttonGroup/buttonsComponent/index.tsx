import { ButtonGroupConfigurator } from '../../../../components/buttonGroupConfigurator';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { getSettings } from './settings';
import { GroupOutlined } from '@ant-design/icons';
import { ButtonsComponentDefinition } from './interfaces';

const ButtonsComponent: ButtonsComponentDefinition = {
  type: 'buttons',
  isInput: true,
  name: 'Buttons',
  isOutput: true,
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <ButtonGroupConfigurator title="Configure Buttons" readOnly={model.readOnly} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
};

export default ButtonsComponent;
