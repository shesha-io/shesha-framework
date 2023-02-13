import React, { FC, ReactNode } from 'react';
import ErrorBoundary from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

interface ICustomErrorBoundaryProps {
  children: ReactNode;
}

export const CustomErrorBoundary: FC<ICustomErrorBoundaryProps> = ({ children }) => {
  return <ErrorBoundary FallbackComponent={CustomErrorBoundaryFallbackComponent}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
