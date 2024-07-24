import { Col, Input, InputNumber, Radio, RadioChangeEvent, Row, Select, Slider } from 'antd';
import React, { FC, useState } from 'react'
import { useStyles } from './styles';
import { BorderBottomOutlined, BorderLeftOutlined, BorderOutlined, BorderRightOutlined, BorderTopOutlined, DashOutlined, ExpandOutlined, MinusOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined, RadiusUpleftOutlined, RadiusUprightOutlined, SmallDashOutlined } from '@ant-design/icons';
import { ColorPicker } from '@/components';
import { IBorderValue } from './interfaces';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

interface IBorderProps {
    onChange?: (value: IBorderValue) => void;
    value?: IBorderValue;
}

const BorderComponent: FC<IBorderProps> = ({ onChange, value = {
    radius: { all: 0 },
    border: {
        all: { width: 1, unit: 'px', color: '#000000', style: 'solid' }
    }
} }) => {
    const { styles } = useStyles();
    const [localValue, setLocalValue] = useState<IBorderValue>(value);
    const [radiusType, setRadiusType] = useState<string>('all');
    const [borderType, setBorderType] = useState<string>('all');

    const updateValue = (newValue: Partial<IBorderValue>) => {
        const updatedValue = { ...localValue, ...newValue };
        setLocalValue(updatedValue);
        onChange?.(updatedValue);
    };

    const updateRadius = (key: string, value: number) => {
        if (value === 0) {
            const newRadius = { ...localValue.radius };
            delete newRadius[key];
            updateValue({ radius: newRadius });
        } else {
            updateValue({ radius: { ...localValue.radius, [key]: value } });
        }
    };

    const updateBorder = (key: string, value: any) => {
        if (value.width === 0) {
            const newBorder = { ...localValue.border };
            delete newBorder[key];
            updateValue({ border: newBorder });
        } else {
            updateValue({ border: { ...localValue.border, [key]: value } });
        }
    };

    const renderRadioGroup = (
        options: { value: string; icon: React.ReactNode; title?: string }[],
        value: string,
        onChange: (e: RadioChangeEvent) => void
    ) => (
        <Radio.Group onChange={onChange} value={value}>
            {options.map(option => (
                <Radio.Button key={option.value} value={option.value} title={option.title}>
                    {option.icon}
                </Radio.Button>
            ))}
        </Radio.Group>
    );

    const radiusOptions = [
        { value: 'all', icon: <ExpandOutlined />, title: 'all' },
        { value: 'topLeft', icon: <RadiusUpleftOutlined />, title: 'top-left' },
        { value: 'topRight', icon: <RadiusUprightOutlined />, title: 'top-right' },
        { value: 'bottomLeft', icon: <RadiusBottomleftOutlined />, title: 'bottom-left' },
        { value: 'bottomRight', icon: <RadiusBottomrightOutlined />, title: 'bottom-right' },
    ];

    const borderOptions = [
        { value: 'all', icon: <BorderOutlined />, title: 'all' },
        { value: 'top', icon: <BorderTopOutlined />, title: 'top' },
        { value: 'right', icon: <BorderRightOutlined />, title: 'right' },
        { value: 'bottom', icon: <BorderBottomOutlined />, title: 'bottom' },
        { value: 'left', icon: <BorderLeftOutlined />, title: 'left' },
    ];

    const styleOptions = [
        { value: 'solid', icon: <MinusOutlined /> },
        { value: 'dashed', icon: <DashOutlined /> },
        { value: 'dotted', icon: <SmallDashOutlined /> },
    ];


    return (
        <Row gutter={[8, 8]} style={{ fontSize: '11px' }} className={styles.container}>
            <Col className="gutter-row" span={24}>
                <span>Radius</span>
            </Col>
            <Col className="gutter-row" span={24}>
                {renderRadioGroup(radiusOptions, radiusType, (e) => setRadiusType(e.target.value))}
            </Col>
            <Col className="gutter-row" span={24}>
                <Row>
                    <Col span={12}>
                        <Slider
                            min={0}
                            max={100}
                            value={localValue.radius[radiusType] || 0}
                            onChange={(value) => updateRadius(radiusType, value)}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={0}
                            max={100}
                            style={{ margin: '0 16px' }}
                            value={localValue.radius[radiusType] || 0}
                            onChange={(value) => updateRadius(radiusType, value)}
                            className={styles.input}
                        />
                    </Col>
                </Row>
            </Col>
            <Col className="gutter-row" span={24}>
                <span>Border</span>
            </Col>
            <Col className="gutter-row" span={24}>
                {renderRadioGroup(borderOptions, borderType, (e) => setBorderType(e.target.value))}
            </Col>
            <Col className="gutter-row" span={24}>
                <Col className="gutter-row" span={6}>
                    <span>Width</span>
                </Col>
                <Col className="gutter-row" span={12}>
                    <Input
                        addonAfter={
                            <Select
                                value={localValue.border[borderType]?.unit || 'px'}
                                onChange={(unit) => updateBorder(borderType, { ...localValue.border[borderType], unit })}
                            >
                                {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                            </Select>
                        }
                        className={styles.input}
                        value={localValue.border[borderType]?.width}
                        onChange={(e) => updateBorder(borderType, { ...localValue.border[borderType], width: e.target.value })}
                    />
                </Col>
            </Col>
            <Col className="gutter-row" span={24}>
                <span>Color</span>
                <div style={{ width: 'calc(100% - 35px)' }}>
                    <ColorPicker
                        allowClear
                        value={localValue.border[borderType]?.color || '#000000'}
                        onChange={(color) => updateBorder(borderType, { ...localValue.border[borderType], color })}
                    />
                </div>
            </Col>
            <Col className="gutter-row" span={24}>
                <span>Style</span>
            </Col>
            <Col className="gutter-row" span={24}>
                {renderRadioGroup(styleOptions, localValue.border[borderType]?.style || 'solid', (e) => updateBorder(borderType, { ...localValue.border[borderType], style: e.target.value }))}
            </Col>
        </Row>
    )
};

export default BorderComponent;