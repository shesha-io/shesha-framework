
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import BackgroundConfigurator from '../_settings/background/background';
import { IBackgroundProps } from '../_settings/background/interfaces';

const Background: IToolboxComponent<IBackgroundProps> = {
    type: 'background',
    name: 'Background Configurator',
    icon: <StrikethroughOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <BackgroundConfigurator value={value} onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    initModel: (model) => {
        return {
            ...model,
            label: 'Background',
        };
    },
    settingsFormMarkup: getSettings(),
};

export default Background;
