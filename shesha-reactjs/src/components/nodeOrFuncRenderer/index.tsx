import { isDefined } from '@/utils/nullables';
import React, { FC, Fragment, ReactNode } from 'react';

export type ReactNodeOrFunc = ReactNode | (() => ReactNode);

type NodeOrFuncRendererProps = {
  children?: ReactNodeOrFunc;
};

export const NodeOrFuncRenderer: FC<NodeOrFuncRendererProps> = ({ children }) => {
  const value = typeof children === 'function'
    ? children()
    : children;

  if (!isDefined(value)) return value;

  const isRactArray = Array.isArray(value) && value.every((item) => !isDefined(item) || React.isValidElement<unknown>(item as unknown));
  const element = typeof value === 'object'
    ? React.isValidElement(value) || isRactArray
      ? value
      : '[object]'
    : value;
  return <Fragment>{element}</Fragment>;
};

export default NodeOrFuncRenderer;
