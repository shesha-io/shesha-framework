
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IShadowComponentProps } from './interfaces';
import ShadowComponent from './shadowComponent';

const ShadowConfigurator: IToolboxComponent<IShadowComponentProps> = {
    type: 'shadowStyle',
    name: 'Shadow Styles',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <ColumnWidthOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model} >
                <ShadowComponent readOnly={model.readOnly} />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default ShadowConfigurator;
