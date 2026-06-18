import { getTagStyle } from '@/utils/style';
import convert from 'color-convert';
import { Tag, Tooltip, TooltipProps } from 'antd';
import React, { CSSProperties } from 'react';
import { ShaIcon, IconType } from '../shaIcon';

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
function ReflistTag({ value, description, color = "", icon, showIcon, tagStyle, solidColor = false, showItemName, label, placement = 'right' }: IReflistTagProps): React.JSX.Element {
  const memoizedColor = !solidColor
    ? color.toLowerCase()
    : convert.keyword.hex(color);

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
        icon={(icon && showIcon) && <ShaIcon iconName={icon as IconType} />}
        style={getTagStyle(tagStyle, !!color)}
      >{showItemName && labelToRender}
      </Tag>
    </Tooltip>
  );
};

export default ReflistTag;
