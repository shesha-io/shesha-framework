import { Col, Input, Radio, Row, Select } from 'antd';
import React, { FC } from 'react';
import { BorderlessTableOutlined, ColumnWidthOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

export interface ISizeValueWithUnit {
    value: number | string;
    unit: string;
}

export interface ISizeValue {
    width?: ISizeValueWithUnit;
    height?: ISizeValueWithUnit;
    minWidth?: ISizeValueWithUnit;
    minHeight?: ISizeValueWithUnit;
    maxWidth?: ISizeValueWithUnit;
    maxHeight?: ISizeValueWithUnit;
    overflow?: string;
}

export interface ISizeType {
    onChange?: (value) => void;
    value?: ISizeValue;
    readOnly?: boolean;
    model?: any;
}

const SizeComponent: FC<ISizeType> = ({ onChange, readOnly, value, model }) => {

    const updateValue = (key: keyof ISizeValue, newUnit: string) => {
        const updatedValue = {
            dimensions: { ...model?.dimensions, [key]: { ...value?.[key] as ISizeValueWithUnit, unit: newUnit } }
        };
        onChange(updatedValue);
    };

    const renderSizeInputWithUnits = (label: string, property: keyof ISizeValue) => {
        const currentValue = value?.[property] && value?.[property] as ISizeValueWithUnit || { value: '', unit: 'px' };

        const selectAfter = (
            <Select
                value={currentValue.unit || 'px'}
                onChange={(unit) => updateValue(property, unit)}
            >
                {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
            </Select>
        );

        return (
            <Col className="gutter-row" span={12}>
                <SettingsFormItem name={`dimensions.${property}.value`} label={label} jsSetting>
                    <Input
                        addonAfter={selectAfter}
                        value={currentValue.value}
                        readOnly={readOnly}
                    />
                </SettingsFormItem>
            </Col>
        );
    };

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }}>
            {renderSizeInputWithUnits('Width', 'width')}
            {renderSizeInputWithUnits('Height', 'height')}
            {renderSizeInputWithUnits('Min W', 'minWidth')}
            {renderSizeInputWithUnits('Min H', 'minHeight')}
            {renderSizeInputWithUnits('Max W', 'maxWidth')}
            {renderSizeInputWithUnits('Max H', 'maxHeight')}
            <Col className="gutter-row" span={24}>
                <SettingsFormItem readOnly={readOnly} name="overflow" label="Overflow" jsSetting>
                    <Radio.Group value={value?.overflow} >
                        <Radio.Button value="visible" title="Visible"><EyeOutlined /></Radio.Button>
                        <Radio.Button value="hidden" title="Hidden"><EyeInvisibleOutlined size={32} /></Radio.Button>
                        <Radio.Button value="scroll" title="Scroll"><ColumnWidthOutlined /></Radio.Button>
                        <Radio.Button value="auto" title="Auto"><BorderlessTableOutlined /></Radio.Button>
                    </Radio.Group>
                </SettingsFormItem>
            </Col>
        </Row>
    );
};

export default SizeComponent;