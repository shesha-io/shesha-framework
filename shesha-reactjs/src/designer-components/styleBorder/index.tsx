
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IBorderProps } from './components/border/interfaces';
import BorderComponent from './components/border/borderComponent';

const BorderConfigurator: IToolboxComponent<IBorderProps> = {
    type: 'borderStyle',
    name: 'Border Configurator',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <StrikethroughOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <BorderComponent value={value} onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default BorderConfigurator;
