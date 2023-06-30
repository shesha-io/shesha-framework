import React, { FC } from 'react';
import { Form, FormItemProps } from "antd";
import { useSettingsPanel } from './settingsCollapsiblePanel';

interface ISettingsFormItemProps extends FormItemProps<any> {
    propertyFilter?: (name: string) => boolean;
}
  
const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    const settingsPanel = useSettingsPanel();
    let propertyFilter = props.propertyFilter;

    if (settingsPanel) {
        settingsPanel.registerField(props.name.toString());
        if (!Boolean(propertyFilter))
            propertyFilter = settingsPanel.getPropertyFilter();
    }

    return !Boolean(propertyFilter) || typeof propertyFilter === 'function' && propertyFilter(props.name?.toString())
        ? <Form.Item {...props}/>
        : null;
};

export default SettingsFormItem;