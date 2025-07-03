import { MenuProps } from 'antd';
import React from 'react';
import { IStyleType } from '@/index';

type MenuItem = MenuProps['items'][number];

/**
 * Removes CSS units from a value and returns the numeric value
 * @param value - CSS value with units (e.g. '10px', '1.5rem', '50%')
 * @returns The numeric value without units
 */
export const removeCssUnit = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value);
};

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
    background: { type: 'color', color: prev.backgroundColor, },
    font: { color: prev.buttonType === 'primary' ? '#fff' : prev.fontColor ?? '', weight: prev.fontWeight ?? '400', size: prev.fontSize ?? 14, type: prev.fontFamily ?? 'Segoe UI', align: 'center' },
    border: {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: {
          width: prev.borderWidth ?? '1px',
          style: prev.borderStyle ?? 'solid',
          color: prev.borderColor ?? '#d9d9d9'
        },
      },
      radius: { all: prev.borderRadius ?? prev.size === 'small' ? 4 : 8 }
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: {
      width: prev.block ? '100%' : 'auto',
      height: prev.height ?? prev.size === 'small' ? '24px' : prev.size === 'middle' ? '32px' : '40px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto'
    },
    stylingBox: '{"paddingLeft":"15","paddingBottom":"4","paddingTop":"4","paddingRight":"15"}',
    style: prev.style ?? '',
  };
};

export const defaultContainerStyles = (): IStyleType => {
  return {
    background: { type: 'color' },
    border: {
      border: { all: { width: '1px', style: 'none', color: '#d9d9d9' } },
      radius: { all: 8 },
      hideBorder: false,
      borderType: 'all',
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
  };
};