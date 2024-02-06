import React, { FC, useState } from 'react';
import { ColorPicker as AntdColorPicker } from 'antd';
import { ColorValueType } from 'antd/es/color-picker/interface';
import { Color } from 'antd/es/color-picker/color';
import type { ColorPickerProps } from 'antd';

type Preset = Required<ColorPickerProps>['presets'][number];
type ColorFormat = ColorPickerProps['format'];

export interface IColorPickerProps {
  value?: ColorValueType;
  onChange?: (color: ColorValueType) => void;
  title?: string;
  presets?: Preset[];
  showText?: boolean;
  allowClear?: boolean;
}

const formatColor = (color: Color, format: ColorFormat) => {
  if (!color)
    return null;

  switch(format) {
    case 'hex': return color.toHexString();
    case 'hsb': return color.toHsbString();
    case 'rgb': return color.toRgbString();
  }
};

export const ColorPicker: FC<IColorPickerProps> = ({ value, onChange, title, presets, showText, allowClear }) => {
  const [format, setFormat] = useState<ColorFormat>('hex');
  
  const handleChange = (value: Color) => {
    const formattedValue = formatColor(value, format);
    onChange(formattedValue);
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <AntdColorPicker
      format={format}
      onFormatChange={setFormat}
      showText={value && showText}
      disabledAlpha /*note: temporary disabled alpha, there is abug in the antd*/
      allowClear={allowClear}
      onClear={handleClear}
      value={value ?? ""}
      onChangeComplete={handleChange}
      presets={presets}
      panelRender={title
        ? (panel) => (
          <div>
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
            {panel}
          </div>
        )
        : undefined
      }
    />
  );
};