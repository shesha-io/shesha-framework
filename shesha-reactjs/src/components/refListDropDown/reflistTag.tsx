import { getTagStyle } from '@/utils/style';
import convert from 'color-convert';
import { Tag, Tooltip, TooltipProps } from 'antd';
import React, { CSSProperties } from 'react';
import { ShaIcon, IconType } from '../shaIcon';
import { isNullOrWhiteSpace } from '@/utils/nullables';

interface IReflistTagProps {
  value?: string | number | undefined;
  description?: string | undefined;
  color?: string | undefined;
  icon?: string | undefined;
  showIcon?: boolean | undefined;
  tagStyle?: CSSProperties | undefined;
  solidColor?: boolean | undefined;
  showItemName?: boolean | undefined;
  label?: string | React.ReactNode | undefined;
  placement?: TooltipProps['placement'] | undefined;
}

const tryConvertToHex = (value: string): string => {
  try {
    return value.startsWith('#')
      ? value
      : convert.keyword.hex(value);
  } catch {
    console.warn(`Failed to convert ${value} to hex`);
    return value;
  }
};

function ReflistTag({ value, description, color = "", icon, showIcon = false, tagStyle, solidColor = false, showItemName = false, label, placement = 'right' }: IReflistTagProps): React.JSX.Element {
  const memoizedColor = !solidColor
    ? color.toLowerCase()
    : tryConvertToHex(color.toLowerCase());

  const labelToRender = typeof label === 'string' ? label.toUpperCase() : label;

  return (
    <Tooltip
      trigger={['hover']}
      title={showItemName ? description : <>{label}<br />{description}</>}
      placement={placement}
      style={{ cursor: 'pointer', zIndex: 2 }}
    >
      <Tag
        key={value}
        color={memoizedColor}
        icon={(!isNullOrWhiteSpace(icon) && showIcon) && <ShaIcon iconName={icon as IconType} />}
        style={getTagStyle(tagStyle, !!color)}
      >{showItemName && labelToRender}
      </Tag>
    </Tooltip>
  );
};

export default ReflistTag;
