import React, { cloneElement, FC, useEffect, useState } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { SettingOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent } from '../../providers';
import { Checkbox, Form, Input } from 'antd';

export interface ITestComponentProps extends IConfigurableFormComponent {
    components?: IConfigurableFormComponent[];
}

interface IData {
    value?: any;
    code?: string;
    mode?: boolean;
}

const TestComponent: IToolboxComponent<ITestComponentProps> = {
    type: 'test',
    isInput: true,
    isOutput: true,
    name: 'Test',
    isHidden: false,
    icon: <SettingOutlined />,
    factory: (model: ITestComponentProps) => {
        
        return (
            <TestControl name='test' label={model.label} valuePropName='value'>
                <Input />
            </TestControl>
        );
    }
};

export interface ITestControlProps {
    children?: React.ReactElement;
    value?: IData | any;
    name?: string;
    label?: string;
    onChange?: (value: IData) => void;
    context?: boolean;
    valuePropName?: string;
}

export const TestControl: FC<ITestControlProps> = (props) => {

    const [mode, setMode] = useState(false);

    return (
        <Form.Item label={props.label}>
            <Form.Item name={props.name}>
                <TestInternalControl {...props} context={mode}>
                    {props.children}
                </TestInternalControl>
            </Form.Item>
            <Checkbox value={props.value?.mode} onChange={(e) => {
                setMode(e.target.checked);
            }}/>
        </Form.Item>
    );
};

export const TestInternalControl: FC<ITestControlProps> = (props) => {
    
    const mode = props.context;

    const valuePropName = mode ? 'value' : props.valuePropName || 'value';


    useEffect(() => {
        props.onChange({...props.value, mode});
    }, [props.context]);

    const mergedProps = {
        ...props.children?.props,
        onChange: (...args: any[]) => {

            const event = args[0];
            let data = null;
            if (event && event.target && typeof event.target === 'object' && valuePropName in event.target)
                data = (event.target as HTMLInputElement)[valuePropName];
            else
                data = event;
            props.onChange({
                value: mode ? props.value?.value : data,
                code:  mode ? data : props.value?.code,
                mode
            });
        },
        [valuePropName]: props?.value?.mode ? props?.value?.code : props?.value?.value
    };

    if (props?.value?.mode) {
        return cloneElement(<Input />, mergedProps);
    } else {
        return cloneElement(props.children, mergedProps);
    }
};

export default TestComponent;
