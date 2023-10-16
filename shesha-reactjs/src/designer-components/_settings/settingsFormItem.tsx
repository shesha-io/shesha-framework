import React, { cloneElement, FC, ReactElement, useEffect, useState } from 'react';
import { Button, Form, FormItemProps } from "antd";
import SettingsControl, { SettingsControlChildrenType } from './settingsControl';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import { getPropertySettingsFromData } from './utils';
import { ConfigurableFormItem, IConfigurableFormItemProps, PropertySettingMode } from 'index';
import './styles/index.less';

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
    const formData = getFieldsValue();
    const initSettings = getPropertySettingsFromData(formData, props.name?.toString());

    const [mode, setMode] = useState<PropertySettingMode>(initSettings._mode ?? 'value');
    const switchMode = () => setMode(mode === 'code' ? 'value' : 'code');

    if (!props.name)
        return null;

    if (typeof props.children === 'function') {
        const children = props.children as SettingsControlChildrenType;
        return (
            <Form.Item {...props} label={props.label} >
                <SettingsControl id={props.name.toString()} propertyName={props.name.toString()} mode={mode}>
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
                <div className={ mode === 'code' ? 'sha-js-content-code' : 'sha-js-content-js'}>
                    <Button
                        disabled={props.disabled || props.readOnly}
                        shape="round"
                        className='sha-js-switch'
                        type='primary'
                        ghost
                        size='small'
                        onClick={switchMode}
                    >
                        {mode === 'code' ? 'Value' : 'JS'}
                    </Button>

                    <SettingsControl id={props.name.toString()} propertyName={props.name.toString()} mode={mode} value={value} onChange={onChange}>
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
                            
                            return <div className={ mode === 'code' ? 'sha-js-content-code' : 'sha-js-content-js'}>
                                <Button
                                    disabled={props.disabled || props.readOnly}
                                    shape="round"
                                    className='sha-js-switch'
                                    type='primary'
                                    ghost
                                    size='small'
                                    onClick={switchMode}
                                >
                                    {mode === 'code' ? 'Value' : 'JS'}
                                </Button>
                                {cloneElement(children, mergedProps)}
                            </div>;
                        }}
                    </SettingsControl>
                </div>);
            }}
        </ConfigurableFormItem>
    );
};

export default SettingsFormItem;