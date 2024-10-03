import React, { FC, PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

export interface ICustomErrorBoundaryProps  {
  componentId?: string;
  componentName?: string;
  componentType?: string;
  model?: any;
}

export const CustomErrorBoundary: FC<PropsWithChildren<ICustomErrorBoundaryProps>> = ({ children, componentId, componentName, componentType, model }) => {

  const fallbackComponent: FC<any> = ({
    error,
    resetErrorBoundary,
  }) => {
    return <CustomErrorBoundaryFallbackComponent 
      error={error} resetErrorBoundary={resetErrorBoundary}
      componentName={componentName} componentType={componentType} componentId={componentId}
      model={model}
    />;
  };

  return <ErrorBoundary FallbackComponent={fallbackComponent as any}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
