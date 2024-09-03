import { Col, Input, Row } from 'antd';
import React, { FC } from 'react';
import FormItem from '@/designer-components/_settings/components/formItem';
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
            <FormItem name={`shadow.${property}`} label={label} jsSetting>
                <Input
                    type='number'
                    value={currentValue}
                    readOnly={readOnly}
                    max={100}
                />
            </FormItem>
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
        <Row >
            {renderInputRow([{ label: 'Offset X', property: 'offsetX' }, { label: 'Offset Y', property: 'offsetY' }])}
            {renderInputRow([{ label: 'Blur', property: 'blurRadius' }, { label: 'Spread', property: 'spreadRadius' }])}
            <Col span={24}>
                <FormItem name="shadow.color" label="Color" jsSetting>
                    <ColorPicker />
                </FormItem>
            </Col>
        </Row>
    );
};

export default ShadowComponent;