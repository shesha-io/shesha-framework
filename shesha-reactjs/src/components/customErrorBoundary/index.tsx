import React, { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import CustomErrorBoundaryFallbackComponent from './fallbackComponent';

export const CustomErrorBoundary: FC = ({ children }) => {
  return <ErrorBoundary FallbackComponent={CustomErrorBoundaryFallbackComponent}>{children}</ErrorBoundary>;
};

export default CustomErrorBoundary;
