import { Row } from 'antd';
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

    console.log("SHADOW VALUE:::", value);

    return (
        <Row >
            <InputRow inputs={[{ label: 'Offset X', property: 'shadow.offsetX', ...commonProps }, { label: 'Offset Y', property: 'shadow.offsetY', ...commonProps }]} />
            <InputRow inputs={[{ label: 'Blur', property: 'shadow.blurRadius', ...commonProps }, { label: 'Spread', property: 'shadow.spreadRadius', ...commonProps }]} />
            <SettingInput type='color' label='Color' property='shadow.color' readOnly={readOnly} value={value} />
        </Row>
    );
};

export default ShadowComponent;