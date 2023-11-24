import React, { FC } from 'react';
import { useBinding } from '@/providers/bindingProvider';
import { IConfigurableFormItemChildFunc } from '@/components/formDesigner/components/formItem';

export interface IDataBinderProps  {
    propertyName?: string;
    valuePropName?: string;
    value?: any;
    onChange?:  (...args: any[]) => void;
    getFieldValue?: (propertyName: string) => object[];
    useBinding?: boolean;
    children: IConfigurableFormItemChildFunc;
}

const DataBinder: FC<IDataBinderProps> = (props) => {
    const { useBinding: ub = false, valuePropName = 'value' } = props;
    const binding = useBinding(false);

    const value = binding && ub ? binding.value : props[valuePropName];
    const onChange = binding && ub ? binding.onChange : props.onChange;
    
    return <>{props.children(value, onChange, props.propertyName, props.getFieldValue)}</>;
};

export { DataBinder };