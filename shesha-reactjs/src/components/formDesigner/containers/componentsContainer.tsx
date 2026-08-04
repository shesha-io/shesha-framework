import React, { CSSProperties, FC, ReactNode } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { useComponentContainer } from '@/providers/form/nesting/containerContext';
import { ContainerDirection } from '../common/interfaces';

export interface IComponentsContainerProps extends IComponentsContainerBaseProps {
  className?: string | undefined;
  render?: ((components: React.JSX.Element[]) => ReactNode) | undefined;
  itemsLimit?: number | undefined;
  dynamicComponents?: IConfigurableFormComponent[] | undefined;
  wrapperStyle?: CSSProperties | undefined;
  style?: CSSProperties | undefined;
  emptyInsertThreshold?: number | undefined;
  showHintWhenEmpty?: boolean | undefined;
  direction?: ContainerDirection | undefined;
  noDefaultStyling?: boolean | undefined;
  additionalDomProperties?: Record<string, unknown> | undefined;
}

const ComponentsContainer: FC<IComponentsContainerProps> = (props) => {
  const ContainerComponent = useComponentContainer();

  return (
    <ContainerComponent {...props} />
  );
};

export default ComponentsContainer;
