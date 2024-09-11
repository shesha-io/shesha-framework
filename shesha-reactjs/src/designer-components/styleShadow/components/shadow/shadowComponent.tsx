import { Row } from 'antd';
import React, { FC } from 'react';

import { InputRow, SettingInput } from '@/designer-components/_settings/components/utils';
import { IShadowValue } from './interfaces';


export interface IShadowType {
    value?: IShadowValue;
    readOnly?: boolean;
    onChange?: (newValue: IShadowValue) => void;
}

const ShadowComponent: FC<IShadowType> = ({ onChange, value, readOnly }) => {

    const commonProps = {
        readOnly,
        value,
    };

    return (
        <Row >
            <InputRow inputs={[{ label: 'Offset X', property: 'offsetX', ...commonProps }, { label: 'Offset Y', property: 'offsetY', ...commonProps }]} />
            <InputRow inputs={[{ label: 'Blur', property: 'blurRadius', ...commonProps }, { label: 'Spread', property: 'spreadRadius', ...commonProps }]} />
            <SettingInput type='color' label='Color' property='color' readOnly={readOnly} value={value} />
        </Row>
    );
};

export default ShadowComponent;