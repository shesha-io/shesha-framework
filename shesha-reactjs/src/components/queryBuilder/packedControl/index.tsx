import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';

export type PackedControlVariant = 'field' | 'value';

interface IPackedSelectProps {
  children: ReactNode;
  className?: string;
  variant: PackedControlVariant;
}

export const PackedSelect: FC<IPackedSelectProps> = ({ children, className, variant }) => {
  return (
    <div className={classNames('sha-query-builder-packed-select', `sha-query-builder-packed-select--${variant}`, className)}>
      {children}
    </div>
  );
};
