import React, { cloneElement, FC, ReactElement } from 'react';
import { ConfigurableFormItem } from '@/components';
import SettingsControl from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
    const { name, label, tooltip, required, hidden, orientation, jsSetting, children, valuePropName = 'value' } = props;
    const childElement = children as ReactElement;
    const readOnly = props.readOnly || childElement.props.readOnly || childElement.props.disabled;

    const handleChange = (onChange) => (...args: any[]) => {
        const event = args[0];
        const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
            ? (event.target as HTMLInputElement)[valuePropName]
            : event;
        onChange(data);
    };

    const createClonedElement = (value, onChange) => cloneElement(
        childElement,
        {
            ...childElement?.props,
            readOnly,
            disabled: readOnly,
            onChange: handleChange(onChange),
            [valuePropName]: value
        }
    );

    return (
        <ConfigurableFormItem
            model={{
                propertyName: name,
                label,
                type: '',
                id: '',
                description: tooltip,
                validate: { required },
                hidden,
                size: 'small'
            }}
            className='sha-js-label'
        >
            {(value, onChange) =>
                jsSetting === false ? (
                    createClonedElement(value, onChange)
                ) : (
                    <SettingsControl
                        propertyName={name}
                        mode={'value'}
                        onChange={onChange}
                        value={value}
                        readOnly={readOnly}
                        orientation={orientation}
                        labelProps={props.labelProps}
                    >
                        {(value, onChange) => createClonedElement(value, onChange)}
                    </SettingsControl>
                )
            }
        </ConfigurableFormItem>
    );
};

export default FormItem;