
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { StrikethroughOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import BackgroundComponent from './components/background/background';
import { IBackgroundProps } from './components/background/interfaces';

const BackgroundConfigurator: IToolboxComponent<IBackgroundProps> = {
    type: 'backgroundStyle',
    name: 'Background Configurator',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <StrikethroughOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                <BackgroundComponent model={model} />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default BackgroundConfigurator;
