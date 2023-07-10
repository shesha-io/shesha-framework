import React, { FC, ReactNode } from 'react';
import { useBinding } from 'providers/bindingProvider';

export interface IDataBinderProps {
    children: (value: any, onChange:  (...args: any[]) => void) => ReactNode;//(e: BindingChangeEvent) => void | undefined) => ReactNode;
}

const DataBinder: FC<IDataBinderProps> = ({ children }) => {
    const { value, onChange } = useBinding();

    return <>{children(value, onChange)}</>;
};

export { DataBinder };