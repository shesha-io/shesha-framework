import React, { FC } from 'react';
import { IConfigurableFormItemChildFunc } from '@/components/formDesigner/components/model';

export interface IDataBinderProps {
    value?: any;
    onChange?: (...args: any[]) => void;
    children: IConfigurableFormItemChildFunc;
    valuePropName?: string;
}

const DataBinder: FC<IDataBinderProps> = (props) => {
    const { onChange, valuePropName, value } = props;
    
    // value may be passed by the Form.Item in a different property
    const effectiveValue = valuePropName ? props[valuePropName] : value;

    return (<>{props.children(effectiveValue, onChange)}</>);
};

const DataBinderMemoized = React.memo(DataBinder);
export { DataBinderMemoized as DataBinder };