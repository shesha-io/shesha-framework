import React, {
    cloneElement,
    FC,
    ReactElement
} from 'react';
import { ConfigurableFormItem, IConfigurableFormItemProps } from '@/components';
import SettingsControl from '../settingsControl';


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
    labelProps?: { hideLabel: boolean; labelAlign: string, onValuesChange?: (newValues) => void };
    model?: any;
}


const FormItem: FC<ISettingsFormItemProps> = (props) => {

    const valuePropName = props.valuePropName ?? 'value';
    const children = props.children as ReactElement;
    const readOnly = props.readOnly || children.props.readOnly || children.props.disabled;

    return (
        <ConfigurableFormItem
            model={{
                propertyName: props.name,
                label: props.label,
                type: '',
                id: '',
                description: props.tooltip,
                validate: { required: props.required },
                hidden: props.hidden,
                size: 'small'
            }}
            orientation={props.orientation}
            className='sha-js-label'
        >
            {(value, onChange) => {
                return (
                    <SettingsControl
                        propertyName={props.name}
                        mode={'value'}
                        onChange={onChange}
                        value={value}
                        readOnly={readOnly}
                        orientation={props.orientation}
                        labelProps={props.labelProps}
                    >
                        {(value, onChange) => {
                            return cloneElement(
                                children,
                                {
                                    ...children?.props,
                                    readOnly: readOnly,
                                    disabled: readOnly,
                                    size: 'small',
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

export default FormItem;