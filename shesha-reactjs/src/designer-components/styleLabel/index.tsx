
import { IToolboxComponent } from '@/interfaces';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import LabelConfiguratorComponent from './labelConfigurator';
import { ILabelComponentProps } from './interfaces';

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
                <LabelConfiguratorComponent readOnly={model.readOnly} />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default LabelConfigurator;
