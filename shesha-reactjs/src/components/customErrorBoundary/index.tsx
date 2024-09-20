import React, { FC, PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

export interface ICustomErrorBoundaryProps  {
  componentName?: string;
  componentType?: string;
}

export const CustomErrorBoundary: FC<PropsWithChildren<ICustomErrorBoundaryProps>> = ({ children, componentName, componentType }) => {

  const fallbackComponent: FC<any> = ({
    error,
    resetErrorBoundary,
  }) => {
    return <CustomErrorBoundaryFallbackComponent 
      error={error} resetErrorBoundary={resetErrorBoundary}
      componentName={componentName} componentType={componentType}
    />;
  };

  return <ErrorBoundary FallbackComponent={fallbackComponent as any}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
