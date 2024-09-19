import React, { FC } from 'react';

import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { IShadowValue } from './interfaces';


export interface IShadowType {
    value?: IShadowValue;
    readOnly?: boolean;
    onChange?: (newValue: IShadowValue) => void;
}

const ShadowComponent: FC<IShadowType> = ({ value, readOnly }) => {

    const commonProps = {
        readOnly,
        value,
    };

    return (
        <>
            <InputRow inputs={[{ label: 'Offset X', property: 'styles.shadow.offsetX', ...commonProps }, { label: 'Offset Y', property: 'styles.shadow.offsetY', ...commonProps }]} />
            <InputRow inputs={[{ label: 'Blur', property: 'styles.shadow.blurRadius', ...commonProps }, { label: 'Spread', property: 'styles.shadow.spreadRadius', ...commonProps }]} />
            <SettingInput type='color' label='Color' property='styles.shadow.color' readOnly={readOnly} value={value} />
        </>
    );
};

export default ShadowComponent;