
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IShadowComponentProps } from './components/shadow/interfaces';
import ShadowComponent from './components/shadow/shadowComponent';

const ShadowConfigurator: IToolboxComponent<IShadowComponentProps> = {
    type: 'shadowStyle',
    name: 'Shadow Styles',
    isInput: false,
    icon: <ColumnWidthOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                {(value) => <ShadowComponent value={value} readOnly={model.readOnly} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default ShadowConfigurator;
