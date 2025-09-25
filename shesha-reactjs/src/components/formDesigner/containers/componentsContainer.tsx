import React, { CSSProperties, FC, ReactNode } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps, IComponentsContainerBaseProps } from '@/interfaces';
import { useComponentContainer } from '@/providers/form/nesting/containerContext';

export interface IComponentsContainerProps extends IComponentsContainerBaseProps, Omit<ICommonContainerProps, 'wrapperStyle'> {
  className?: string;
  render?: (components: JSX.Element[]) => ReactNode;
  itemsLimit?: number;
  dynamicComponents?: IConfigurableFormComponent[];
  wrapperStyle?: CSSProperties;
}

const ComponentsContainer: FC<IComponentsContainerProps> = (props) => {
  const ContainerComponent = useComponentContainer();

  return (
    <ContainerComponent {...props} />
  );
};

export default ComponentsContainer;
