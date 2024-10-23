import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { SettingInput } from '../_settings/components/settingsInput';


export interface IShadowType {
    readOnly?: boolean;
}



const ShadowComponent: FC<IShadowType> = ({ readOnly }) => {

    return (
        <>
            <InputRow inputs={[{ label: 'Offset X', propertyName: `styles.shadow.offsetX`, readOnly }, { label: 'Offset Y', propertyName: `styles.shadow.offsetY`, readOnly }]} />
            <InputRow inputs={[{ label: 'Blur', propertyName: `styles.shadow.blurRadius`, readOnly, }, { label: 'Spread', propertyName: `styles.shadow.spreadRadius`, readOnly }]} />
            <SettingInput inputType='color' label='Color' propertyName={`styles.shadow.color`} readOnly={readOnly} />
        </>
    );
};

export default ShadowComponent;