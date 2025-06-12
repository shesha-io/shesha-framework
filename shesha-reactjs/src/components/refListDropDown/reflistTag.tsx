import { getTagStyle } from '@/utils/style';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Tag, Tooltip, TooltipProps } from 'antd';
import React from 'react';
import { Icon } from '../readOnlyDisplayFormItem';
function ReflistTag({ value, tooltip, color, icon, showIcon, tagStyle, solidColor, showItemName, label, placement = 'right' }) {

    const memoizedColor = solidColor
        ? convertCssColorNameToHex(color ?? '')
        : color?.toLowerCase();

    return (
        <Tooltip title={tooltip} placement={placement as TooltipProps['placement']} style={{ cursor: 'pointer' }}>
            <Tag
                key={value}
                color={memoizedColor}
                icon={(icon && showIcon) && <Icon type={icon} />}
                style={getTagStyle(tagStyle, !!color)}
            >{showItemName && label}</Tag>
        </Tooltip>
    );
};

export default ReflistTag;