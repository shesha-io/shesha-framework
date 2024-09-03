
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import SizeComponent from './components/size/sizeComponent';
import { ISizeComponentProps } from './components/size/interfaces';

const SizeConfigurator: IToolboxComponent<ISizeComponentProps> = {
    type: 'sizeStyle',
    name: 'Size',
    isInput: false,
    icon: <ColumnWidthOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <SizeComponent value={value} onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default SizeConfigurator;
