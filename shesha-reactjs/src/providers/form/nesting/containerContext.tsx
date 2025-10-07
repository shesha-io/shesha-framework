import React, { FC, PropsWithChildren, useContext } from 'react';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { createNamedContext } from '@/utils/react';

export type ContainerType = FC<IComponentsContainerBaseProps>;

export const ComponentsContainerContext = createNamedContext<ContainerType>(undefined, "ComponentsContainerContext");

export interface IComponentsContainerProviderProps {
  ContainerComponent: ContainerType;
}
export const ComponentsContainerProvider: FC<PropsWithChildren<IComponentsContainerProviderProps>> = ({ ContainerComponent, children }) => {
  return (
    <ComponentsContainerContext.Provider value={ContainerComponent}>
      {children}
    </ComponentsContainerContext.Provider>
  );
};

export function useComponentContainer(): ContainerType {
  const context = useContext(ComponentsContainerContext);

  if (!context)
    throw new Error('useComponentContainer must be used within a ComponentsContainerProvider');

  return context;
};
