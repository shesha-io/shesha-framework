import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { CaretDownOutlined } from '@ant-design/icons';

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

interface IPackedSourceTriggerProps {
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  variant: PackedControlVariant;
}

export const PackedSourceTrigger: FC<IPackedSourceTriggerProps> = ({ disabled, icon, title, variant }) => {
  return (
    <button
      type="button"
      className={classNames('sha-query-builder-source-trigger', `sha-query-builder-source-trigger--${variant}`)}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      <span className="sha-query-builder-source-trigger-icon">{icon}</span>
      <CaretDownOutlined className="sha-query-builder-source-trigger-arrow" />
    </button>
  );
};
