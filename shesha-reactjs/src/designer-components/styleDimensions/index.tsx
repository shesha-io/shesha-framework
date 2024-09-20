
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { ColumnWidthOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import SizeComponent from './sizeComponent';
import { IDimensionsProps } from './interfaces';

const SizeConfigurator: IToolboxComponent<IDimensionsProps> = {
    type: 'DimensionsStyle',
    name: 'Dimensions',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    icon: <ColumnWidthOutlined />,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                {() => <SizeComponent model={model} readOnly={model.readOnly} />}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default SizeConfigurator;
