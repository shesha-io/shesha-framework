
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
    name: 'Prefix Suffix',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <ColumnWidthOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                <PrefixSuffixComponent />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default PrefixSuffixConfigurator;
