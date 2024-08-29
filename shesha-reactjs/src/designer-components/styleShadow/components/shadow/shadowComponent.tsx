import { Col, Input, Row } from 'antd';
import React, { FC } from 'react';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { IShadowValue } from './interfaces';
import { ColorPicker } from '@/components';


export interface IShadowType {
    value?: IShadowValue;
    readOnly?: boolean;
}

const ShadowComponent: FC<IShadowType> = ({ readOnly, value }) => {

    const renderSizeInput = (label, property) => {
        const currentValue = value?.[property];

        return (
            <SettingsFormItem name={`shadow.${property}`} label={label} jsSetting>
                <Input
                    type='number'
                    value={currentValue}
                    readOnly={readOnly}
                    max={100}
                />
            </SettingsFormItem>
        );
    };

    const renderInputRow = (inputs: Array<{ label: string, property }>) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px', width: '100%' }}>
            {inputs.map(({ label, property }) => (
                <div key={property} style={{ flex: '1 1 100px', minWidth: '100px' }}>
                    {renderSizeInput(label, property)}
                </div>
            ))}
        </div>
    );

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }}>
            {renderInputRow([{ label: 'Offset X', property: 'offsetX' }, { label: 'Offset Y', property: 'offsetY' }])}
            {renderInputRow([{ label: 'Blur', property: 'blurRadius' }, { label: 'Spread', property: 'spreadRadius' }])}
            <Col span={24}>
                <SettingsFormItem readOnly={readOnly} name="shadow.color" label="Color" jsSetting>
                    <ColorPicker readOnly={readOnly} />
                </SettingsFormItem>
            </Col>

        </Row>
    );
};

export default ShadowComponent;