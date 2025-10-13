import React, { CSSProperties, FC, ReactNode, useState } from 'react';
import { ColorPicker as AntdColorPicker } from 'antd';
import { ColorValueType } from 'antd/es/color-picker/interface';
import { AggregationColor } from 'antd/es/color-picker/color';
import type { ColorPickerProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useTheme, IConfigurableTheme } from '@/index';

type Preset = Required<ColorPickerProps>['presets'][number];
type ColorFormat = ColorPickerProps['format'];
type ColorPickerOnChange = ColorPickerProps['onChange'];

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

const formatColor = (color: AggregationColor, format: ColorFormat): string | null => {
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
export const readThemeColor = (theme: IConfigurableTheme): Record<string, string> => ({
  primary: theme.application?.primaryColor,
  success: theme.application?.successColor,
  warning: theme.application?.warningColor,
  error: theme.application?.errorColor,
  info: theme.application?.infoColor,
  processing: theme.application?.processingColor,
  primaryTextColor: theme?.text?.default,
  secondaryTextColor: theme?.text?.secondary,
});

export const ColorPicker: FC<IColorPickerProps> = ({
  value,
  onChange,
  title,
  presets,
  showText,
  allowClear,
  disabledAlpha,
  readOnly,
  size,
  style,
  defaultValue,
}) => {
  const [format, setFormat] = useState<ColorFormat>('hex');
  const { theme } = useTheme();

  const handleChange: ColorPickerOnChange = (value) => {
    const formattedValue = formatColor(value, format);
    onChange(formattedValue);
  };

  const handleClear = (): void => {
    onChange(null);
  };

  const onPanelClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  const panelRender = (panel: React.ReactNode): ReactNode => (
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

  const containerStyle: CSSProperties = {
    ...style,
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    transform: 'scale(1)',
    transformOrigin: 'center center',
    overflow: 'visible',
    alignItems: 'start',
  };

  const wrapperStyle: CSSProperties = {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
  };

  const scaleContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
    transform: 'scale(1)',
    transformOrigin: 'center center',
    transition: 'transform 0.1s ease',
  };

  return (
    <div style={wrapperStyle}>
      <div style={scaleContainerStyle}>
        <AntdColorPicker
          trigger="click"
          format={format}
          onFormatChange={setFormat}
          disabledAlpha={disabledAlpha}
          showText={value && showText}
          allowClear={allowClear}
          disabled={readOnly}
          onClear={handleClear}
          size={size}
          style={containerStyle}
          value={(readThemeColor(theme)[value as string] ?? value) ?? ""}
          defaultValue={readThemeColor(theme)?.[defaultValue as string] ?? defaultValue}
          onChange={handleChange}
          presets={presets}
          panelRender={panelRender}
        />
      </div>
    </div>
  );
};
