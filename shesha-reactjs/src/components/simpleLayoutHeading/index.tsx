import React, { CSSProperties, FC } from 'react';
import LayoutHeading from '../layoutHeading';

export interface ISimpleLayoutHeadingProps {
  title?: string;
  style?: CSSProperties;
  className?: string;
}

export const SimpleLayoutHeading: FC<ISimpleLayoutHeadingProps> = props => <LayoutHeading {...props} />;

export default SimpleLayoutHeading;
