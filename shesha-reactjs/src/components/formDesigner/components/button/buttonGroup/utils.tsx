import { MenuProps } from 'antd';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { VisibilityType } from '../../../../..';
import ShaIcon, { IconType } from '../../../../shaIcon';
import { IButtonGroupProps } from './models';

type MenuItem = Required<MenuProps>['items'][number];

export function getButtonGroupMenuItem(
  label: React.ReactNode,
  key: React.Key,
  disabled = false,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    children,
    label,
    className: 'sha-button-menu',
    disabled,
  } as MenuItem;
}

export const getButtonGroupIcon = (icon: ReactNode, isParent?: boolean) => {
  if (typeof icon === 'string')
    return <ShaIcon iconName={icon as IconType} className={classNames({ 'is-parent-menu': isParent })} />;

  if (React.isValidElement(icon)) return icon;
  return null;
};

export const getButtonGroupItems = (model: IButtonGroupProps): IButtonGroupProps['items'] =>
  (model?.items || []).filter(({ visibility }) => !(['No', 'Removed'] as VisibilityType[]).includes(visibility));
