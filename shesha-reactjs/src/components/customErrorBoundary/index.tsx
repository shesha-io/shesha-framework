import React, { FC, PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

export interface ICustomErrorBoundaryProps {
  componentId?: string | undefined;
  componentName?: string | undefined;
  componentType?: string | undefined;
}

export const CustomErrorBoundary: FC<PropsWithChildren<ICustomErrorBoundaryProps>> = ({ children, componentId, componentName, componentType }) => {
  const fallbackComponent: FC<FallbackProps> = ({
    error,
    resetErrorBoundary,
  }) => {
    return (
      <CustomErrorBoundaryFallbackComponent
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        componentName={componentName}
        componentType={componentType}
        componentId={componentId}
      />
    );
  };

  return <ErrorBoundary FallbackComponent={fallbackComponent}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
