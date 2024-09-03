import { Col, Input, Radio, Row, Select } from 'antd';
import React, { FC, useCallback } from 'react';
import { BorderlessTableOutlined, ColumnWidthOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import FormItem from '@/designer-components/_settings/components/formItem';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

export interface IValueWithUnit {
    value: number | string;
    unit: string;
}

export interface ISizeValue {
    width?: IValueWithUnit;
    height?: IValueWithUnit;
    minWidth?: IValueWithUnit;
    minHeight?: IValueWithUnit;
    maxWidth?: IValueWithUnit;
    maxHeight?: IValueWithUnit;
    overflow?: string;
}

export interface ISizeType {
    onChange?: (value) => void;
    value?: ISizeValue;
    readOnly?: boolean;
    model?: any;
    noOverflow?: boolean;
}

const SizeComponent: FC<ISizeType> = ({ onChange, readOnly, value, model, noOverflow }) => {

    const updateValue = useCallback((key: keyof ISizeValue, newUnit: string) => {
        const updatedValue = {
            dimensions: { ...model?.dimensions, [key]: { ...value?.[key] as IValueWithUnit, unit: newUnit } }
        };
        onChange(updatedValue);
    }, [model, value, onChange]);

    const renderSizeInputWithUnits = (label: string, property: keyof ISizeValue) => {
        const currentValue = value?.[property] as IValueWithUnit || { value: '', unit: 'px' };

        return (
            <FormItem name={`dimensions.${property}.value`} label={label} jsSetting>
                <Input
                    addonAfter={
                        <Select
                            value={currentValue.unit || 'px'}
                            onChange={(unit) => updateValue(property, unit)}
                            dropdownStyle={{ width: '70px' }}
                        >
                            {units.map(unit => (
                                <Option key={unit} value={unit}>{unit}</Option>
                            ))}
                        </Select>
                    }
                    value={currentValue.value}
                />
            </FormItem>
        );
    };

    const renderInputRow = (inputs: Array<{ label: string, property: keyof ISizeValue }>) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px', width: '100%' }}>
            {inputs.map(({ label, property }) => (
                <div key={property} style={{ flex: '1 1 100px', minWidth: '100px' }}>
                    {renderSizeInputWithUnits(label, property)}
                </div>
            ))}
        </div>
    );

    return (
        <Row gutter={[8, 2]}>
            {renderInputRow([
                { label: 'Width', property: 'width' },
                { label: 'Height', property: 'height' }
            ])}
            {renderInputRow([
                { label: 'Min W', property: 'minWidth' },
                { label: 'Min H', property: 'minHeight' }
            ])}
            {renderInputRow([
                { label: 'Max W', property: 'maxWidth' },
                { label: 'Max H', property: 'maxHeight' }
            ])}
            {!noOverflow && (
                <Col className="gutter-row" span={24}>
                    <FormItem name="overflow" label="Overflow" jsSetting>
                        <Radio.Group value={value?.overflow}>
                            <Radio.Button value="visible" title="Visible"><EyeOutlined /></Radio.Button>
                            <Radio.Button value="hidden" title="Hidden"><EyeInvisibleOutlined /></Radio.Button>
                            <Radio.Button value="scroll" title="Scroll"><ColumnWidthOutlined /></Radio.Button>
                            <Radio.Button value="auto" title="Auto"><BorderlessTableOutlined /></Radio.Button>
                        </Radio.Group>
                    </FormItem>
                </Col>
            )}
        </Row>
    );
};

export default SizeComponent;
