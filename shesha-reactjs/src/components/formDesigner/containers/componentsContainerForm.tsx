import React, { FC } from 'react';
import { ComponentsContainerDesigner } from './componentsContainerDesigner';
import { IComponentsContainerProps } from './componentsContainer';
import { useIsDrawingForm } from '@/providers/form';
import { ComponentsContainerLive } from './componentsContainerLive';
import { ComponentsContainerDynamic } from './componentsContainerDynamic';

export const ComponentsContainerFormInner: FC<IComponentsContainerProps> = (props) => {
  const isDrawing = useIsDrawingForm();

  return props.dynamicComponents && props.dynamicComponents.length > 0
    ? <ComponentsContainerDynamic {...props} />
    : isDrawing
      ? <ComponentsContainerDesigner {...props} />
      : <ComponentsContainerLive {...props} />;
};

export const ComponentsContainerForm = React.memo(ComponentsContainerFormInner);
