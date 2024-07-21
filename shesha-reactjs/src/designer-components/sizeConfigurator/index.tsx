
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import SizeComponent from '../_settings/size/sizeComponent';
import { ISizeComponentProps } from '../_settings/size/interfaces';

const SizeConfigurator: IToolboxComponent<ISizeComponentProps> = {
    type: 'size',
    name: 'Size',
    icon: <ColumnWidthOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => <SizeComponent value={value} onChange={onChange} />}
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

export default SizeConfigurator;
