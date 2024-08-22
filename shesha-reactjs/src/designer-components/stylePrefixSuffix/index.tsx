
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { ISizeComponentProps } from './components/prefixSuffix/interfaces';
import PrefixSuffixComponent from './components/prefixSuffix/prefixSuffixComponent';

const SizeConfigurator: IToolboxComponent<ISizeComponentProps> = {
    type: 'size',
    name: 'Size',
    isInput: false,
    icon: <ColumnWidthOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model: passedModel }) => {
        const { size, ...model } = passedModel;

        return (
            <ConfigurableFormItem model={model}>
                {(onChange) => <PrefixSuffixComponent onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default SizeConfigurator;
