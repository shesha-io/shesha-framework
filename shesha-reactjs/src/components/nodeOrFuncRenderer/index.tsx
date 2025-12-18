import { isDefined } from '@/utils/nullables';
import React, { FC, Fragment, PropsWithChildren, ReactNode } from 'react';

export type ReactNodeOrFunc = ReactNode | (() => ReactNode);

export const NodeOrFuncRenderer: FC<PropsWithChildren<any>> = ({ children }) => {
  const value = typeof children === 'function' ? children() : children;
  if (!isDefined(value)) return value;
  const isRactArray = Array.isArray(value) && value.every((item) => React.isValidElement(item) || !isDefined(item));
  const element = typeof value === 'object'
    ? React.isValidElement(value) || isRactArray
      ? value
      : '[object]'
    : value;
  return <Fragment>{element}</Fragment>;
};

export default NodeOrFuncRenderer;
