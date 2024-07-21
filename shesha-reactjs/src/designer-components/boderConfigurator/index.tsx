
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IBorderProps } from '../_settings/border/interfaces';
import BorderComponent from '../_settings/border/borderComponent';

const BorderConfigurator: IToolboxComponent<IBorderProps> = {
    type: 'border',
    name: 'Border Configurator',
    icon: <StrikethroughOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <BorderComponent value={value} onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    initModel: (model) => {
        return {
            ...model,
            label: 'Size',
        };
    },
    settingsFormMarkup: getSettings(),
};

export default BorderConfigurator;
