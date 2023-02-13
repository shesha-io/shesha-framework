import React, { FC, Fragment, PropsWithChildren, ReactNode } from 'react';

export type ReactNodeOrFunc = ReactNode | (() => ReactNode);

export const NodeOrFuncRenderer: FC<PropsWithChildren<any>> = ({ children }) => {
  return <Fragment>{typeof children === 'function' ? children() : children}</Fragment>;
};

export default NodeOrFuncRenderer;
