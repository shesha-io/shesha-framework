import React, { FC, ReactNode, useEffect, useState } from 'react';

export interface IDataBinderExState {
    value?: any;
    onChange?: (...args: any[]) => void;
}

export interface IDataBinderExProps  {
    valuePropName?: string;
    value?: any;
    onChange?:  (...args: any[]) => void;
    children: (value: any, onChange:  (...args: any[]) => void) => ReactNode;
}

const DataBinderEx: FC<IDataBinderExProps> = ({ valuePropName = 'value', onChange, children, ...props }) => {

    const value = props[valuePropName];
    const [state, setState] = useState<IDataBinderExState>({value, onChange});

    useEffect(() => {
        setState({value, onChange});
    }, [value, onChange]);

    // ToDo: Remove after debug
    const onChangeInternal = (...args: any[]) => {
        console.log('DataBinderEx.onChangeInternal');
        state.onChange(...args);
    };

    return <>{children(state.value, onChangeInternal)}</>;
};

export { DataBinderEx };