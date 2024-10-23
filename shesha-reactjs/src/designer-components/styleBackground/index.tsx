
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { BlockOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import BackgroundComponent from './background';
import { IBackgroundProps } from './interfaces';

const BackgroundConfigurator: IToolboxComponent<IBackgroundProps> = {
    type: 'backgroundStyle',
    name: 'Background Configurator',
    isInput: false,
    isOutput: true,
    icon: <BlockOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                <BackgroundComponent />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default BackgroundConfigurator;
