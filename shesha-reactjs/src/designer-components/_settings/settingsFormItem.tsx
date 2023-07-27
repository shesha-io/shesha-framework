import React, { cloneElement, FC, ReactElement, ReactNode, useState } from 'react';
import { Button, Form, FormItemProps } from "antd";
import SettingsControl, { SettingsControlChildrentype } from './settingsControl';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import { getPropertySettingsFromData } from './utils';
import { PropertySettingMode } from 'index';

interface ISettingsFormItemProps extends Omit<FormItemProps<any>, 'children'> {
    jsSetting?: boolean;
    readonly children?: ReactNode | SettingsControlChildrentype;
}
  
const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    const settingsPanel = useSettingsPanel(false);
    if (settingsPanel && props.name) {
        settingsPanel.registerField(props.name.toString());
    }

    const { propertyFilter } = useSettingsForm<any>();
    return !Boolean(propertyFilter) || typeof propertyFilter === 'function' && propertyFilter(props.name?.toString())
        ? props.jsSetting
            ? <SettingsFormComponent {...props}/>
            : <Form.Item {...props as FormItemProps<any>}/>
        : null;
};

const SettingsFormComponent: FC<ISettingsFormItemProps> = (props) => {
    const { getFieldsValue } = useSettingsForm<any>();
    const formData = getFieldsValue();
    const initSettings = getPropertySettingsFromData(formData, props.name.toString());

    const [ mode, setMode ] = useState<PropertySettingMode>(initSettings._mode ?? 'value');
    const switchMode = () => setMode(mode === 'code' ? 'value' : 'code');

    const label = 
        <>
            <label>{props.label}</label>
            <Button
                shape="round"
                style={{marginLeft: 5, marginRight: 5}}
                type='primary' ghost  size='small' 
                onClick={switchMode}>
                {mode === 'code' ? 'VALUE' : 'JS'}
            </Button>
        </>;

    if (typeof props.children === 'function') {
        const children = props.children as SettingsControlChildrentype;
        return (
            <Form.Item {...props} label={label} >
                <SettingsControl id={props.name.toString()} propertyName={props.name.toString()} mode={mode}>
                    {(value, onChange, propertyName) => children(value, onChange, propertyName)}
                </SettingsControl>
            </Form.Item>
        );
    }
    
    const valuePropName = props.valuePropName ?? 'value';
    const children = props.children as ReactElement;
    return (
        <Form.Item {...props} label={label} valuePropName='value' >
            <SettingsControl id={props.name.toString()} propertyName={props.name.toString()} mode={mode}>
                {(value, onChange) => {
                    const mergedProps = {
                        ...children?.props,
                        onChange: (...args: any[]) => {
                            const event = args[0];
                            const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
                                ? (event.target as HTMLInputElement)[valuePropName]
                                : event;
                            onChange(data);
                        },
                        [valuePropName]: value
                    };
                    return cloneElement(children, mergedProps);
                }}
            </SettingsControl>
        </Form.Item>
    );
};

export default SettingsFormItem;