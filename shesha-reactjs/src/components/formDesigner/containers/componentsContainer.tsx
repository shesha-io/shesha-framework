import React, { CSSProperties, FC, ReactNode } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps, IComponentsContainerBaseProps } from '@/interfaces';
import { useComponentContainer } from '@/providers/form/nesting/containerContext';

export interface IComponentsContainerProps extends IComponentsContainerBaseProps, Omit<ICommonContainerProps, 'wrapperStyle'> {
  className?: string | undefined;
  render?: ((components: React.JSX.Element[]) => ReactNode) | undefined;
  itemsLimit?: number | undefined;
  dynamicComponents?: IConfigurableFormComponent[] | undefined;
  wrapperStyle?: CSSProperties | undefined;
  emptyInsertThreshold?: number | undefined;
  showHintWhenEmpty?: boolean | undefined;
}

const ComponentsContainer: FC<IComponentsContainerProps> = (props) => {
  const ContainerComponent = useComponentContainer();

  return (
    <ContainerComponent {...props} />
  );
};

export default ComponentsContainer;
