import { Col, Input, Radio, RadioChangeEvent, Row, Select } from 'antd';
import React, { FC, useState } from 'react';
import { useStyles } from './styles';
import { BorderlessTableOutlined, ColumnWidthOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

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
    onChange?: (value: ISizeValue) => void;
    value?: ISizeValue;
}

const SizeComponent: FC<ISizeType> = ({ onChange, value = { width: null, height: null, minWidth: null, minHeight: null, maxHeight: null, maxWidth: null } }) => {
    const { styles } = useStyles();
    const [localValue, setLocalValue] = useState<ISizeValue>(value);

    const updateValue = (key: keyof ISizeValue, newValue: ISizeValueWithUnit | string) => {
        const updatedValue = { ...localValue, [key]: newValue };
        setLocalValue(updatedValue);
        onChange?.(updatedValue);
    };

    const renderSizeInput = (label: string, property: keyof ISizeValue) => {
        const currentValue = localValue[property] && localValue[property] as ISizeValueWithUnit || { value: '', unit: 'px' };

        const selectAfter = (
            <Select
                value={currentValue.unit}
                onChange={(unit) => updateValue(property, { ...currentValue, unit })}
            >
                {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
            </Select>
        );

        return (
            <Col className="gutter-row" span={12}>
                <span>{label}</span>
                <Input
                    addonAfter={selectAfter}
                    className={styles.input}
                    value={currentValue.value}
                    onChange={(e) => updateValue(property, { ...currentValue, value: e.target.value })}
                />
            </Col>
        );
    };

    const onOverflowChange = (e: RadioChangeEvent) => {
        updateValue('overflow', e.target.value);
    };

    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }} className={styles.container}>
            {renderSizeInput('Width', 'width')}
            {renderSizeInput('Height', 'height')}
            {renderSizeInput('Min W', 'minWidth')}
            {renderSizeInput('Min H', 'minHeight')}
            {renderSizeInput('Max W', 'maxWidth')}
            {renderSizeInput('Max H', 'maxHeight')}
            <Col className="gutter-row" span={24}>
                <span>Overflow</span>
            </Col>
            <Col className="gutter-row" span={24}>
                <Radio.Group onChange={onOverflowChange} value={localValue.overflow} >
                    <Radio.Button value="visible" title="Visible"><EyeOutlined /></Radio.Button>
                    <Radio.Button value="hidden" title="Hidden"><EyeInvisibleOutlined size={32} /></Radio.Button>
                    <Radio.Button value="scroll" title="Scroll"><ColumnWidthOutlined /></Radio.Button>
                    <Radio.Button value="auto" title="Auto"><BorderlessTableOutlined /></Radio.Button>
                </Radio.Group>
            </Col>
        </Row>
    );
};

export default SizeComponent;