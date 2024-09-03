
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import PrefixSuffixComponent, { IPrefixSuffixType } from './components/prefixSuffix/prefixSuffixComponent';

export interface IPrefixSuffixProps extends IConfigurableFormComponent {
    onChange?: (value: IPrefixSuffixType) => void;
    value?: IPrefixSuffixType;
}
const PrefixSuffixConfigurator: IToolboxComponent<IPrefixSuffixProps> = {
    type: 'prefixSuffixStyle',
    name: 'Size',
    isInput: false,
    icon: <ColumnWidthOutlined />,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                {(onChange) => <PrefixSuffixComponent onChange={onChange} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default PrefixSuffixConfigurator;
