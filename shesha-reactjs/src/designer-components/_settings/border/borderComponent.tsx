import { Col, Input, InputNumber, Radio, RadioChangeEvent, Row, Select, Slider } from 'antd';
import React, { FC, useState } from 'react'
import { useStyles } from './styles';
import { BorderBottomOutlined, BorderLeftOutlined, BorderOutlined, BorderRightOutlined, BorderTopOutlined, DashOutlined, ExpandOutlined, MinusOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined, RadiusUpleftOutlined, RadiusUprightOutlined, SmallDashOutlined } from '@ant-design/icons';
import { CollapsiblePanel, ColorPicker } from '@/components';
import { IBorderValue } from './interfaces';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

export interface IBorderType {
    onChange?: (value: IBorderValue) => void;
    value?: IBorderValue;
}

const BorderComponent: FC<IBorderType> = ({ onChange, value }) => {
    const { styles } = useStyles();
    const [localValue, setLocalValue] = useState<IBorderValue>(value);

    const updateValue = (key: keyof IBorderValue, newValue: any) => {
        const updatedValue = { ...localValue, [key]: { ...localValue[key], ...newValue } };
        setLocalValue(updatedValue);
        onChange?.(updatedValue);
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
        { value: 'top-left', icon: <RadiusUpleftOutlined />, title: 'top-left' },
        { value: 'top-right', icon: <RadiusUprightOutlined />, title: 'top-right' },
        { value: 'bottom-left', icon: <RadiusBottomleftOutlined />, title: 'bottom-left' },
        { value: 'bottom-right', icon: <RadiusBottomrightOutlined />, title: 'bottom-right' },
    ];

    const borderOptions = [
        { value: 'all', icon: <BorderOutlined /> },
        { value: 'top', icon: <BorderTopOutlined /> },
        { value: 'right', icon: <BorderRightOutlined /> },
        { value: 'bottom', icon: <BorderBottomOutlined /> },
        { value: 'left', icon: <BorderLeftOutlined /> },
    ];

    const styleOptions = [
        { value: 'solid', icon: <MinusOutlined /> },
        { value: 'dashed', icon: <DashOutlined /> },
        { value: 'dotted', icon: <SmallDashOutlined /> },
    ];

    return (
        <CollapsiblePanel header='Border' className={styles.container} isSimpleDesign ghost>
            <Row gutter={[8, 8]} style={{ width: 200, fontSize: '11px' }}>
                <Col className="gutter-row" span={24}>
                    <span>Radius</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(radiusOptions, localValue.radius.type, (e) => updateValue('radius', { type: e.target.value }))}
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Px </span>
                </Col>
                <Col className="gutter-row" span={24}>
                    <Row>
                        <Col span={12}>
                            <Slider
                                min={0}
                                max={100}
                                value={localValue.radius.value}
                                onChange={(value) => updateValue('radius', { value })}
                            />
                        </Col>
                        <Col span={4}>
                            <InputNumber
                                min={1}
                                max={20}
                                style={{ margin: '0 16px' }}
                                value={localValue.radius.value}
                                onChange={(value) => updateValue('radius', { value })}
                                className={styles.input}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Border</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(borderOptions, localValue.border.type, (e) => updateValue('border', { type: e.target.value }))}
                </Col>
                <Col className="gutter-row" span={24}>
                    <Col className="gutter-row" span={6}>
                        <span>Width</span>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Input
                            addonAfter={
                                <Select
                                    value={localValue.border.width.unit}
                                    onChange={(unit) => updateValue('border', { width: { ...localValue.border.width, unit } })}
                                >
                                    {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                                </Select>
                            }
                            className={styles.input}
                            value={localValue.border.width.value}
                            onChange={(e) => updateValue('border', { width: { ...localValue.border.width, value: e.target.value } })}
                            style={{ width: 'calc(100%)' }}
                        />
                    </Col>
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Color</span>
                    <div style={{ width: 'calc(100% - 35px)' }}>
                        <ColorPicker
                            allowClear
                            value={localValue.border.color}
                            onChange={(color) => updateValue('border', { color })}
                        />
                    </div>
                </Col>
                <Col className="gutter-row" span={24}>
                    <span>Style</span>
                </Col>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(styleOptions, localValue.border.style, (e) => updateValue('border', { style: e.target.value }))}
                </Col>
            </Row>
        </CollapsiblePanel>
    )
};

export default BorderComponent;