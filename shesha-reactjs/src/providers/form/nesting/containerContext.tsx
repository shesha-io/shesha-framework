import React, { FC, PropsWithChildren, useContext } from 'react';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { createNamedContext } from '@/utils/react';
import { throwError } from '@/utils/errors';

export type ContainerType = FC<IComponentsContainerBaseProps>;

export const ComponentsContainerContext = createNamedContext<ContainerType | undefined>(undefined, "ComponentsContainerContext");

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

export const useComponentContainer = (): ContainerType => useContext(ComponentsContainerContext) ?? throwError("useComponentContainer must be used within a ComponentsContainerProvider");
