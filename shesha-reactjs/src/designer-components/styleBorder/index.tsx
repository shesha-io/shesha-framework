
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IBorderProps } from './interfaces';
import BorderComponent from './borderComponent';

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
                <BorderComponent readOnly={model.readOnly} />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default BorderConfigurator;
