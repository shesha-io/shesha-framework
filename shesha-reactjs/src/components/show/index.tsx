import React, { useMemo, FC, Fragment, PropsWithChildren, ReactNode } from 'react';

export interface IShowProps {
  when: boolean;
  loadingComponent?: ReactNode;
}

/**
 * Use <Show> for conditional logic. It takes a singular when prop for a condition to match for. When the condition is truthy, the children will render, otherwise they will not
 */
export const Show: FC<PropsWithChildren<IShowProps>> = ({ children, when = false, loadingComponent }) => {
  const memoizedWhen = useMemo(() => when, [when]);

  if (!when && loadingComponent) {
    return <Fragment>{loadingComponent}</Fragment>;
  }

  return memoizedWhen ? <Fragment>{children}</Fragment> : null;
};

export default Show;
