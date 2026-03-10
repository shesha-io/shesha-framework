import React, { FC, PropsWithChildren } from 'react';
import { IConfigurableFormComponent } from '@/interfaces';
import DynamicComponent from './dynamicComponent';

export type Direction = 'horizontal' | 'vertical';
export interface IProps {
  components: IConfigurableFormComponent[];
  direction?: Direction;
  justifyContent?: string;
  className?: string;
}
const DynamicContainer: FC<PropsWithChildren<IProps>> = ({ components, children, direction = 'vertical', className }) => {
  const renderComponents = (): JSX.Element[] => {
    return components?.map((component) => <DynamicComponent model={component} key={component.id} />);
  };

  return (
    <div className={`sha-components-container ${direction} ${className}`}>
      <div className="sha-components-container-inner">{renderComponents()}</div>
      {children}
    </div>
  );
};

export default DynamicContainer;
