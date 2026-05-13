import { QuestionCircleOutlined } from '@ant-design/icons';
import { Input, InputNumber, Space, Tooltip } from 'antd';
import React, { FC } from 'react';
import { ColorPicker, SectionSeparator, Show } from '@/components';
import { humanizeString } from '@/utils/string';
import { useTheme } from '@/providers';
import Icon from '@/components/icon/Icon';
import { PRESET_COLORS, SHESHA_COLORS } from './presetColors';

/**
 * Header component for theme sections
 */
export interface IHeaderProps {
  title?: string;
  subtitle?: string;
}

export const HeaderContent: FC<IHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ margin: 0, color: '#969696' }}>{title}</h4>
      <p style={{ margin: 0, color: theme?.application?.primaryColor }}>{subtitle}</p>
    </div>
  );
};

/**
 * Props for the input renderer
 */
export interface IRenderInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  icon?: string;
  label?: string;
  hint?: string;
  type?: 'number' | 'string';
  disabled?: boolean;
}

/**
 * Renders an input field with optional icon and tooltip
 */
export const RenderInput: FC<IRenderInputProps> = ({
  value,
  onChange,
  icon,
  label,
  hint,
  type = 'number',
  disabled = false,
}) => (
  <Space>
    <Show when={Boolean(label)}>
      <span>{humanizeString(label)} </span>
    </Show>
    <Show when={Boolean(hint)}>
      <Tooltip title={hint}>
        <span className="sha-input-tooltip" style={{ cursor: 'pointer' }}>
          <QuestionCircleOutlined />
        </span>
      </Tooltip>
    </Show>
    {type === 'number' ? (
      <InputNumber
        prefix={icon ? <Icon icon={icon} style={{ color: '#d9d9d9', height: 16 }} /> : undefined}
        value={value}
        size="small"
        onChange={(val) => onChange(val ?? 0)}
        disabled={disabled}
      />
    ) : (
      <Input
        prefix={icon ? <Icon icon={icon} /> : undefined}
        value={value}
        size="small"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    )}
  </Space>
);

/**
 * Props for the color picker renderer
 */
export interface IRenderColorProps {
  colorName: string;
  initialColor: string;
  onChange: (color: any) => void;
  presetColors?: string[];
  hint?: string;
  label?: string;
  readonly?: boolean;
  className?: string;
  colorPickerClassName?: string;
}

/**
 * Renders a color picker with label and presets
 */
export const RenderColor: FC<IRenderColorProps> = ({
  colorName,
  label,
  initialColor,
  onChange,
  presetColors,
  hint,
  readonly = false,
  className,
  colorPickerClassName,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
    <Space className={className}>
      <Show when={Boolean(colorName)}>
        <span>{label ? label : humanizeString(colorName)} </span>
      </Show>
      <Show when={Boolean(hint)}>
        <Tooltip title={hint}>
          <span className="sha-color-tooltip" style={{ cursor: 'pointer' }}>
            <QuestionCircleOutlined />
          </span>
        </Tooltip>
      </Show>
      <ColorPicker
        title={humanizeString(colorName)}
        presets={[
          { label: 'Presets', defaultOpen: true, colors: presetColors ?? PRESET_COLORS },
          { label: 'Shesha', defaultOpen: false, colors: SHESHA_COLORS },
        ]}
        value={initialColor}
        onChange={onChange}
        readOnly={readonly}
        allowClear={true}
        style={{ border: 'none' }}
        className={colorPickerClassName}
        size="small"
      />
    </Space>
  </div>
);

/**
 * Renders a section divider
 */
export const RenderDivider: FC = () => (
  <SectionSeparator lineColor="#d9d9d9" lineThickness={1} lineWidth="100%" />
);
