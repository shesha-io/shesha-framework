import React, { FC, PropsWithChildren } from 'react';
import { Form, FormItemProps } from "antd";
import SettingsControl from './settingsControl';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';

interface ISettingsFormItemProps extends PropsWithChildren<FormItemProps<any>> {
    jsSetting?: boolean;
}
  
const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    const settingsPanel = useSettingsPanel();
    if (settingsPanel) {
        settingsPanel.registerField(props.name.toString());
    }

    const { propertyFilter } = useSettingsForm<any>();
    return !Boolean(propertyFilter) || typeof propertyFilter === 'function' && propertyFilter(props.name?.toString())
        ? props.jsSetting
            ? <SettingsFormComponent {...props}/>
            : <Form.Item {...props}/>
        : null;
};

const SettingsFormComponent: FC<ISettingsFormItemProps> = (model) => {
    const { getFieldsValue, onValuesChange } = useSettingsForm<any>();

    const formData = getFieldsValue();
    return (
        <Form.Item {...model} name={undefined} >
            <SettingsControl 
                formData={formData}
                onChangeValues={(changedValues) => (onValuesChange(changedValues))}
                name={model.name.toString()}
            >
                <Form.Item {...model} label={undefined}>
                    {model.children}
                </Form.Item>
            </SettingsControl>
        </Form.Item>
    );
};

export default SettingsFormItem;