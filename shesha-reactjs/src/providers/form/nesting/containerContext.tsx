import React, { createContext, FC, PropsWithChildren, useContext } from 'react';
import { IComponentsContainerBaseProps } from '@/interfaces';

export type ContainerType = FC<IComponentsContainerBaseProps>;

export interface IContainerContext {
    ContainerComponent: ContainerType;
}

export const ComponentsContainerContext = createContext<IContainerContext>(undefined);

export interface IComponentsContainerProviderProps {
    ContainerComponent: ContainerType;
}
export const ComponentsContainerProvider: FC<PropsWithChildren<IComponentsContainerProviderProps>> = ({ ContainerComponent, children }) => {
    return (
        <ComponentsContainerContext.Provider value={{ ContainerComponent }}>
            {children}
        </ComponentsContainerContext.Provider>
    );
};

export function useComponentContainer() {
    const context = useContext(ComponentsContainerContext);

    if (!context)
        throw new Error('useFormActions must be used within a FormProvider');

    return context;
};