import React, { CSSProperties, FC, PropsWithChildren } from 'react';
import classnames from 'classnames';

export interface IScrollProps {
  scrollX?: boolean;
  scrollY?: boolean;
  style?: CSSProperties;
}

export const Scroll: FC<PropsWithChildren<IScrollProps>> = ({ children, scrollX, scrollY, style }) => (
  <div style={style} className={classnames('scroll', { 'scroll-x': scrollX }, { 'scroll-y': scrollY })}>
    {children}
  </div>
);

export default Scroll;
