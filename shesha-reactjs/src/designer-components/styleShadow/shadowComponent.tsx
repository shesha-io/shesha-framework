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
    type: 'text',
    text: {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 0,
        spreadRadius: 0,
        color: '#000000'
    },
    box: {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 0,
        spreadRadius: 0,
        color: '#000000'
    }
};

const ShadowComponent: FC<IShadowType> = ({ value: shadowVal = initialShadowValue, readOnly }) => {

    const value = { ...initialShadowValue, ...shadowVal };
    const { type } = value;

    return (
        <>
            <SettingInput type='radio' label='Shadow Type' property='styles.shadow.type' readOnly={readOnly} value={value.type} buttonGroupOptions={[{ title: 'Text', value: 'text', icon: <LinkedinOutlined /> }, { title: 'Box', value: 'box', icon: <MinusSquareOutlined /> }]} />
            <InputRow inputs={[{ label: 'Offset X', property: `styles.shadow.${type}.offsetX`, value: value[`${type}`].offsetX, readOnly }, { label: 'Offset Y', property: `styles.shadow.${type}.offsetY`, value: value[`${type}`].offsetY, readOnly }]} />
            <InputRow inputs={[{ label: 'Blur', property: `styles.shadow.${type}.blurRadius`, readOnly, value: value[`${type}`].blurRadius }, { label: 'Spread', property: `styles.shadow.${type}.spreadRadius`, readOnly, value: value[`${type}`].spreadRadius }]} />
            <SettingInput type='color' label='Color' property={`styles.shadow.${type}.color`} readOnly={readOnly} value={value[`${type}`].color} />
        </>
    );
};

export default ShadowComponent;