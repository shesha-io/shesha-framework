import React, { cloneElement, FC, ReactElement, useEffect } from 'react';
import { Form, FormItemProps } from "antd";
import SettingsControl, { SettingsControlChildrenType } from './settingsControl';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import { getPropertySettingsFromData } from './utils';
import { ConfigurableFormItem, IConfigurableFormItemProps } from '@/components';

interface ISettingsFormItemProps extends Omit<IConfigurableFormItemProps, 'model'> {
    name?: string;
    label?: string;
    jsSetting?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    required?: boolean;
    tooltip?: string;
    hidden?: boolean;
}

const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
    const settingsPanel = useSettingsPanel(false);

    useEffect(() => {
        if (settingsPanel && props.name) {
            settingsPanel.registerField(props.name.toString());
        }
    }, [settingsPanel, props.name]);

    const { propertyFilter } = useSettingsForm<any>();
    return !Boolean(propertyFilter) || typeof propertyFilter === 'function' && propertyFilter(props.name?.toString())
        ? <SettingsFormComponent {...props} />
        : null;
};

const SettingsFormComponent: FC<ISettingsFormItemProps> = (props) => {
    const { getFieldsValue } = useSettingsForm<any>();

    if (!props.name)
        return null;

    const formData = getFieldsValue();
    const { _mode: mode } = getPropertySettingsFromData(formData, props.name?.toString());
    
    if (typeof props.children === 'function') {
        const children = props.children as SettingsControlChildrenType;
        return (
            <Form.Item {...props} label={props.label} >
                <SettingsControl propertyName={props.name.toString()} mode={mode}>
                    {(value, onChange, propertyName) => children(value, onChange, propertyName)}
                </SettingsControl>
            </Form.Item>
        );
    }

    if (!props.jsSetting) {
        return <Form.Item {...props as FormItemProps<any>}>{props.children}</Form.Item>;
    }

    const valuePropName = props.valuePropName ?? 'value';
    const children = props.children as ReactElement;
    return (
        <ConfigurableFormItem 
            model={{ 
                propertyName: props.name,
                label: props.label,
                type: '',
                id: '',
                description: props.tooltip,
                validate: {required: props.required},
                hidden: props.hidden
            }} 
            className='sha-js-label'
        >
            {(value, onChange) => {
                return (
                    <SettingsControl 
                        propertyName={props.name.toString()} 
                        mode={'value'} 
                        onChange={onChange}
                        value={value}
                    >
                        {(value, onChange) => {
                            return cloneElement(
                                children,
                                {
                                    ...children?.props,
                                    onChange: (...args: any[]) => {
                                        const event = args[0];
                                        const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
                                            ? (event.target as HTMLInputElement)[valuePropName]
                                            : event;
                                        onChange(data);
                                    },
                                    [valuePropName]: value
                                });
                        }}
                    </SettingsControl>
                );
            }}
        </ConfigurableFormItem>
    );
};

export default SettingsFormItem;