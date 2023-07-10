import React, { ComponentType, FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from 'react';

export interface IBindingProviderStateContext {
    value?: any;
    onChange?: (...args: any[]) => void;
}

export const BindingProviderStateContext = createContext<IBindingProviderStateContext>({});

export interface IBindingProviderProps  {
    valuePropName?: string;
    value?: any;
    onChange?:  (...args: any[]) => void;
}

const BindingProvider: FC<PropsWithChildren<IBindingProviderProps>> = ({valuePropName = 'value', onChange, children, ...props}) => {
    const value = props[valuePropName];
    const [state, setState] = useState<IBindingProviderStateContext>({value, onChange});

    useEffect(() => {
        setState({value, onChange});
    }, [value, onChange]);

    return (
        <BindingProviderStateContext.Provider value={state}>
            {children}
        </BindingProviderStateContext.Provider>
    );
};

function useBinding(require: boolean = true) {
    const stateContext = useContext(BindingProviderStateContext);
  
    if ((stateContext === undefined) && require)
      throw new Error('useDataContext must be used within a DataSourcesProvider');

    return stateContext;
}

const withBinding = <P extends object>(
    Component: ComponentType<P>,
  ): FC<P> => props => {

    const { value, onChange } = useBinding() ?? {};
    const model = {...props} as any;
    if (!!onChange) {
        model.onChange = onChange;
        model.value = value;
    }

    return <Component {...model} />;
};

export { BindingProvider, useBinding, withBinding };