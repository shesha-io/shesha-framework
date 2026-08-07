import { getTagStyle } from '@/utils/style';
import convert from 'color-convert';
import { Tag, Tooltip, TooltipProps } from 'antd';
import React, { CSSProperties } from 'react';
import { ShaIcon, IconType } from '../shaIcon';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { TagVariant } from '../dropdown/model';

interface IReflistTagProps {
  value?: string | number | undefined;
  description?: string | undefined;
  color?: string | undefined;
  icon?: string | undefined;
  showIcon?: boolean | undefined;
  tagStyle?: CSSProperties | undefined;
  /** How the tag is filled. Defaults to solid. */
  variant?: TagVariant | undefined;
  showItemName?: boolean | undefined;
  label?: string | React.ReactNode | undefined;
  placement?: TooltipProps['placement'] | undefined;
  /** Renders the close affordance — set when the tag represents a removable multi-select selection. */
  closable?: boolean | undefined;
  onClose?: ((event?: React.MouseEvent<HTMLElement, MouseEvent>) => void) | undefined;
}

const tryConvertToHex = (value: string): string => {
  try {
    // `convert.keyword.hex` returns the digits without a leading `#` ("red" -> "FF0000"), which is
    // not a valid CSS colour on its own.
    return value.startsWith('#')
      ? value
      : `#${convert.keyword.hex(value)}`;
  } catch {
    console.warn(`Failed to convert ${value} to hex`);
    return value;
  }
};

function ReflistTag({ value, description, color = "", icon, showIcon = false, tagStyle, variant = 'solid', showItemName = false, label, placement = 'right', closable, onClose }: IReflistTagProps): React.JSX.Element {
  const memoizedColor = variant === 'solid'
    ? tryConvertToHex(color.toLowerCase())
    : color.toLowerCase();

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
        variant={variant}
        color={memoizedColor}
        icon={(!isNullOrWhiteSpace(icon) && showIcon) && <ShaIcon iconName={icon as IconType} />}
        style={getTagStyle(tagStyle, !!color)}
        {...(closable === true ? { closable: true } : {})}
        {...(isDefined(onClose) ? { onClose } : {})}
        /* Keep the click from reaching the select, which would reopen the popup on removal. */
        onMouseDown={(e) => {
          if (closable === true)
            e.stopPropagation();
        }}
      >{showItemName && labelToRender}
      </Tag>
    </Tooltip>
  );
};

export default ReflistTag;
