
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { FileTextOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getSettings } from './settings';
import { IFontComponentProps } from './components/font/interfaces';
import FontComponent from './components/font/fontComponent';

const FontConfigurator: IToolboxComponent<IFontComponentProps> = {
    type: 'fontStyle',
    name: 'Font Style',
    icon: <FileTextOutlined />,
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
    Factory: ({ model }) => {

        return (
            <ConfigurableFormItem model={model}>
                <FontComponent model={model} readOnly={model.readOnly}/>
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default FontConfigurator;
