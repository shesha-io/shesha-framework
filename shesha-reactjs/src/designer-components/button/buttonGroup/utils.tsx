import { MenuProps } from 'antd';
import React from 'react';
import { IStyleType } from '@/index';

type MenuItem = MenuProps['items'][number];

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
};

export const defaultStyles = (prev): IStyleType => {
  return {
    background: { type: 'color' },
    font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
    border: {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: {
          width: '1px',
          style: 'none',
          color: '#d9d9d9'
        },
      },
      radius: { all: 8 }
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: { width: prev.block ? '100%' : 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    stylingBox: '{"paddingLeft":"15","paddingBottom":"4","paddingTop":"4","paddingRight":"15"}',
  };
};

export const defaultContainerStyles = (prev): IStyleType => {
  return {
    background: { type: 'color' },
    border: {
      border: { all: { width: '1px', style: 'none', color: '#d9d9d9' } },
      radius: { all: 8 },
      hideBorder: false,
      borderType: 'all',
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: { width: prev.block ? '100%' : 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
  };
};