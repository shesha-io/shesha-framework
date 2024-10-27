import React, { FC } from 'react';
import { InputRow } from '@/designer-components/_settings/components/utils';
import { SettingInput } from '../_settings/components/settingsInput';


export interface IShadowType {
    readOnly?: boolean;
}



const ShadowComponent: FC<IShadowType> = ({ readOnly }) => {

    return (
        <>
            <InputRow readOnly={readOnly} inputs={[{ label: 'Offset X', propertyName: `inputStyles.shadow.offsetX`, readOnly: readOnly }, { label: 'Offset Y', propertyName: `inputStyles.shadow.offsetY`, readOnly: readOnly }]} />
            <InputRow readOnly={readOnly} inputs={[{ label: 'Blur', propertyName: `inputStyles.shadow.blurRadius`, readOnly: readOnly, }, { label: 'Spread', propertyName: `inputStyles.shadow.spreadRadius`, readOnly: readOnly }]} />
            <SettingInput inputType='color' label='Color' propertyName={`inputStyles.shadow.color`} readOnly={readOnly} />
        </>
    );
};

export default ShadowComponent;