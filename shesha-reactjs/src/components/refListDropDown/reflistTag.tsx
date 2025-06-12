import { getTagStyle } from '@/utils/style';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Tag } from 'antd';
import React from 'react';
import { Icon } from '../readOnlyDisplayFormItem';

function ReflistTag({ value, color, icon, showIcon, tagStyle, solidColor, showItemName, label }) {

    const memoizedColor = solidColor
        ? convertCssColorNameToHex(color ?? '')
        : color?.toLowerCase();

    return (
        <Tag
            key={value}
            color={memoizedColor}
            icon={(icon && showIcon) && <Icon type={icon} />}
            style={getTagStyle(tagStyle, !!color)}
        >{showItemName && label}</Tag>
    );
};

export default ReflistTag;