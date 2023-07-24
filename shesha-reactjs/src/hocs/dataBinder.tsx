import React, { FC, ReactNode } from 'react';
import { useBinding } from 'providers/bindingProvider';

export interface IDataBinderProps  {
    valuePropName?: string;
    value?: any;
    onChange?:  (...args: any[]) => void;
    useBinding?: boolean;
    children: (value: any, onChange:  (...args: any[]) => void) => ReactNode;
}

const DataBinder: FC<IDataBinderProps> = (props) => {
    const { useBinding: ub = false, valuePropName = 'value' } = props;
    const binding = useBinding(false);

    const value = binding && ub ? binding.value : props[valuePropName];
    const onChange = binding && ub ? binding.onChange : props.onChange;
    
    return <>{props.children(value, onChange)}</>;
};

export { DataBinder };