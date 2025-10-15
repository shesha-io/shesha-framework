
import { IToolboxComponent } from '@/interfaces';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import LabelConfiguratorComponent from './labelConfigurator';
import { ILabelComponentProps } from './interfaces';
import { getSettings } from './settings';

const LabelConfigurator: IToolboxComponent<ILabelComponentProps> = {
  type: 'labelConfigurator',
  name: 'Label Configurator',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ColumnWidthOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <LabelConfiguratorComponent labelAlignOptions={model.labelAlignOptions} readOnly={model.readOnly} label={model.label} />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings(),
};

export default LabelConfigurator;
