import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { IShadowValue } from './interfaces';
import { SettingInput } from '../_settings/components/settingsInput';


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
            <InputRow inputs={[{ label: 'Offset X', propertyName: `styles.shadow.offsetX`, value: value.offsetX, readOnly }, { label: 'Offset Y', propertyName: `styles.shadow.offsetY`, value: value.offsetY, readOnly }]} />
            <InputRow inputs={[{ label: 'Blur', propertyName: `styles.shadow.blurRadius`, readOnly, value: value.blurRadius }, { label: 'Spread', propertyName: `styles.shadow.spreadRadius`, readOnly, value: value.spreadRadius }]} />
            <SettingInput inputType='color' label='Color' propertyName={`styles.shadow.color`} readOnly={readOnly} value={value.color} />
        </>
    );
};

export default ShadowComponent;