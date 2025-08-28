import { getTagStyle } from '@/utils/style';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Tag, Tooltip, TooltipProps } from 'antd';
import React, { CSSProperties } from 'react';
import { Icon } from '../readOnlyDisplayFormItem';

interface IReflistTagProps {
    value?: string | number;
    description?: string;
    color?: string;
    icon?: string | React.ReactNode;
    showIcon?: boolean;
    tagStyle?: CSSProperties;
    solidColor?: boolean;
    showItemName?: boolean;
    label?: string | React.ReactNode;
    placement?: TooltipProps['placement'];
}
function ReflistTag({ value, description, color, icon, showIcon, tagStyle, solidColor, showItemName, label, placement = 'right' }: IReflistTagProps) {

    const memoizedColor = !solidColor
        ? color?.toLowerCase()
        : convertCssColorNameToHex(color ?? '');

    const labelToRender = typeof label === 'string' ? label.toUpperCase() : label;

    return (
        <Tooltip trigger={['hover']} title={showItemName ? description : <>{label}<br />{description}</>} placement={placement as TooltipProps['placement']} style={{ cursor: 'pointer', zIndex: 2 }}>
            <Tag
                key={value}
                color={memoizedColor}
                icon={(icon && showIcon) && <Icon type={icon} />}
                style={getTagStyle(tagStyle, !!color)}
            >{showItemName && labelToRender}</Tag>
        </Tooltip>
    );
};

export default ReflistTag;