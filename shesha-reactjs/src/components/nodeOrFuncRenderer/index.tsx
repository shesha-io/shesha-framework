import { isDefined } from '@/utils/nullables';
import React, { FC, Fragment, PropsWithChildren, ReactNode } from 'react';

export type ReactNodeOrFunc = ReactNode | (() => ReactNode);

export const NodeOrFuncRenderer: FC<PropsWithChildren<any>> = ({ children }) => {
  const value = typeof children === 'function' ? children() : children;
  return (
    <Fragment>
      {isDefined(value) && typeof value === 'object'
        ? React.isValidElement(value) || (Array.isArray(value) && value.every((item) => React.isValidElement(item)))
          ? value
          : '[object]'
        : value}
    </Fragment>
  );
};

export default NodeOrFuncRenderer;
