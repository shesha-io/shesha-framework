import React, { CSSProperties, FC, useState } from 'react';
import { ColorPicker as AntdColorPicker } from 'antd';
import { ColorValueType } from 'antd/es/color-picker/interface';
import { Color } from 'antd/es/color-picker/color';
import type { ColorPickerProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useTheme, IConfigurableTheme } from '@/index';

type Preset = Required<ColorPickerProps>['presets'][number];
type ColorFormat = ColorPickerProps['format'];

export interface IColorPickerProps {
  value?: ColorValueType;
  onChange?: (color: ColorValueType) => void;
  title?: string;
  presets?: Preset[];
  showText?: boolean;
  allowClear?: boolean;
  disabledAlpha?: boolean;
  readOnly?: boolean;
  size?: SizeType;
  style?: CSSProperties;
  defaultValue?: ColorValueType;
}

const formatColor = (color: Color, format: ColorFormat) => {
  if (!color)
    return null;

  switch (format) {
    case 'hex': return color.toHexString();
    case 'hsb': return color.toHsbString();
    case 'rgb': return color.toRgbString();
  }
};

/**
 * 
 * @param theme 
 * @returns a (object) map of theme colors with keys as `primary`, `success`, `warning`, `error`, `info`, `processing`
 */
export const readThemeColor = (theme: IConfigurableTheme) => ({
  'primary': theme.application?.primaryColor,
  'success': theme.application?.successColor,
  'warning': theme.application?.warningColor,
  'error': theme.application?.errorColor,
  'info': theme.application?.infoColor,
  'processing': theme.application?.processingColor,
  'primaryTextColor': theme?.text?.default,
  'secondaryTextColor': theme?.text?.secondary
});

export const ColorPicker: FC<IColorPickerProps> = ({ value, onChange, title, presets, showText, allowClear, disabledAlpha, readOnly, size, style, defaultValue }) => {
  const [format, setFormat] = useState<ColorFormat>('hex');
  const { theme } = useTheme();

  const handleChange = (value: Color) => {
    const formattedValue = formatColor(value, format);
    onChange(formattedValue);
  };

  const handleClear = () => {
    onChange(null);
  };

  const onPanelClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const panelRender = (panel: React.ReactNode) => (
        <div onClick={onPanelClick}>
        {title && (
          <div
            style={{
              fontSize: 12,
              color: 'rgba(0, 0, 0, 0.88)',
              lineHeight: '20px',
              marginBottom: 8,
            }}
          >
            {title}
          </div>

        )}
        {panel}
      </div>
    );

  return (
    <AntdColorPicker
      trigger='click'
      format={format}
      onFormatChange={setFormat}
      disabledAlpha={disabledAlpha}
      showText={value && showText}
      allowClear={allowClear}
      disabled={readOnly}
      onClear={handleClear}
      size={size}
      style={style}
      value={(readThemeColor(theme)[value as string] ?? value) ?? ""}
      defaultValue={readThemeColor(theme)?.[defaultValue as string] ?? defaultValue}
      onChange={handleChange}
      presets={presets}
      panelRender={panelRender}
    />
  );
};