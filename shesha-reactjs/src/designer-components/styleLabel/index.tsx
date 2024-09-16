
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import LabelConfiguratorComponent from './components/label/labelConfigurator';
import { ILabelComponentProps } from './components/label/interfaces';

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
                <LabelConfiguratorComponent value={{ ...model }} readOnly={model.readOnly} />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default LabelConfigurator;
