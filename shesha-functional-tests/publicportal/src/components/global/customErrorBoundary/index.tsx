import React, { FC, ReactNode, PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

interface ICustomErrorBoundaryProps {
  children: ReactNode;
}

export const CustomErrorBoundary: FC<PropsWithChildren<ICustomErrorBoundaryProps>> = ({ children }) => {
  return <ErrorBoundary FallbackComponent={CustomErrorBoundaryFallbackComponent}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
