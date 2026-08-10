import { CSSProperties } from 'react';
import { IFontValue } from './interfaces';
import { isDefined } from '@/utils/nullables';

export const getFontStyle = (input?: IFontValue): CSSProperties => {
  if (!input) return {};

  const style: CSSProperties = {};

  if (isDefined(input.size)) {
    const size = input.size;
    if (size) {
      style.fontSize = size + 'px';
    }
  }

  if (isDefined(input.type)) {
    style.fontFamily = input.type;
  }

  if (isDefined(input.weight)) {
    style.fontWeight = (input.weight.split(' - ')[0] ?? '400') || 400;
  }

  if (isDefined(input.color)) {
    style.color = input.color;
  }

  if (isDefined(input.align)) {
    style.textAlign = input.align;
  }

  if (isDefined(input.transform)) {
    style.transform = input.transform;
  }

  return style;
};

export const fontTypes = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times new roman' },
  { value: 'Courier New', label: 'Courier new' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Comic Sans MS', label: 'Comic sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Arial Black', label: 'Arial black' },
  { value: 'Impact', label: 'Impact' },
  { value: '-apple-system', label: 'San francisco' },
  { value: 'BlinkMacSystemFont', label: 'Blinkmac system font' },
  { value: 'SF Mono', label: 'San francisco mono' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Pt Sans', label: 'PT sans' },
  { value: 'Source Sans Pro', label: 'Source sans pro' },
  { value: 'Fira Sans', label: 'Fira sans' },
  { value: 'Playfair Display', label: 'Playfair display' },
  { value: 'Noto Sans', label: 'Noto sans' },
  { value: 'Droid Sans', label: 'Droid sans' },
  { value: 'Crimson Text', label: 'Crimson text' },
  { value: 'PT Serif', label: 'PT serif' },
];

export const fontWeightsOptions = [
  { value: '100', label: 'Thin (100)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '700', label: 'Bold (700)' },
  { value: '900', label: 'Black (900)' },
];

export const textAlignOptions = [
  { value: 'left', label: 'Left', icon: 'AlignLeftOutlined' },
  { value: 'center', label: 'Center', icon: 'AlignCenterOutlined' },
  { value: 'right', label: 'Right', icon: 'AlignRightOutlined' },
];
