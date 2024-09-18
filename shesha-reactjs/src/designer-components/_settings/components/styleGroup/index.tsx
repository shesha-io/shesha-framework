import React from 'react';
import { FolderOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components';
import { IStyleGroupProps } from './models';
import { getSettings } from './settings';
import { IToolboxComponent } from '@/interfaces';
import StyleGroupComponent from './styleGroup';


const StyleGroup: IToolboxComponent<IStyleGroupProps> = {
    type: 'styleGroup',
    isInput: true,
    isOutput: true,
    name: 'Style Group',
    icon: <FolderOutlined />,
    Factory: ({ model }) => {

        return model.hidden ? null : (
            <ConfigurableFormItem model={model}>
                <StyleGroupComponent />
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: getSettings(),
};

export default StyleGroup;
