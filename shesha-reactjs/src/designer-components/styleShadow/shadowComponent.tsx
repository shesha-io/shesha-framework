import React, { FC } from 'react';

import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { IShadowValue } from './interfaces';
import { LinkedinOutlined, MinusSquareOutlined } from '@ant-design/icons';


export interface IShadowType {
    value?: IShadowValue;
    readOnly?: boolean;
    onChange?: (newValue: IShadowValue) => void;
}

export const initialShadowValue: IShadowValue = {
    offsetX: 0,
    offsetY: 0,
    blurRadius: 0,
    spreadRadius: 0,
    color: '#000000'
};

const ShadowComponent: FC<IShadowType> = ({ value: shadowVal = initialShadowValue, readOnly }) => {

    const value = { ...initialShadowValue, ...shadowVal };

    return (
        <>
            <InputRow inputs={[{ label: 'Offset X', property: `styles.shadow.offsetX`, value: value.offsetX, readOnly }, { label: 'Offset Y', property: `styles.shadow.offsetY`, value: value.offsetY, readOnly }]} />
            <InputRow inputs={[{ label: 'Blur', property: `styles.shadow.blurRadius`, readOnly, value: value.blurRadius }, { label: 'Spread', property: `styles.shadow.spreadRadius`, readOnly, value: value.spreadRadius }]} />
            <SettingInput type='color' label='Color' property={`styles.shadow.color`} readOnly={readOnly} value={value.color} />
        </>
    );
};

export default ShadowComponent;