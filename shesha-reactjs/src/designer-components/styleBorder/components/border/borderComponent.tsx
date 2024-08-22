import { Col, Input, InputNumber, Radio, Row, Select } from 'antd';
import React, { FC } from 'react';
import { BorderBottomOutlined, BorderLeftOutlined, BorderOutlined, BorderRightOutlined, BorderTopOutlined, DashOutlined, ExpandOutlined, MinusOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined, RadiusUpleftOutlined, RadiusUprightOutlined, SmallDashOutlined } from '@ant-design/icons';
import { ColorPicker } from '@/components';
import { IBorderValue } from './interfaces';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

interface IBorderProps {
    onChange?: (value) => void;
    value?: IBorderValue;
    readOnly?: boolean;
    model?: any;
}

const BorderComponent: FC<IBorderProps> = ({ onChange, model, readOnly, value }) => {

    const activeBorder = value?.activeBorder || 'all';
    const activeRadius = value?.activeRadius || 'all';

    const renderRadioGroup = (
        options: { value: string; icon: React.ReactNode; title?: string }[],
        value: string,
        type: string,
        property?: string
    ) => (
        <SettingsFormItem name={property ? `border.border.${value}.${property}` : `border.active${type}`} label={`${type || ''} ${value} ${property || ''}`} jsSetting>
            <Radio.Group>
                {options.map(option => (
                    <Radio.Button key={option.value} value={option.value} title={option.title}>
                        {option.icon}
                    </Radio.Button>
                ))}
            </Radio.Group>
        </SettingsFormItem>
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

    const addOnAfter = (
        <Select
            value={value?.border?.[activeBorder]?.unit || 'px'}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(unit) => onChange({ ...model, border: { ...value, border: { ...value.border, [activeBorder]: { ...value.border?.[activeBorder], unit } } } })}>
            {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
        </Select>);

    return (
        <Row gutter={[8, 2]} style={{ fontSize: '11px' }}>
            <Col className="gutter-row" span={24}>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(radiusOptions, activeRadius, 'Radius')}
                </Col>
                <Col className="gutter-row" span={24}>
                    <SettingsFormItem readOnly={readOnly} name={`border.radius.${activeRadius}`} label='Degrees' jsSetting>
                        <InputNumber
                            min={0}
                            max={20}
                            value={value?.radius?.[activeRadius]}
                        />
                    </SettingsFormItem>
                </Col>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(borderOptions, activeBorder, 'Border')}
                </Col>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                    <div style={{ flex: '1 1 100px', minWidth: '100px' }}>
                        <SettingsFormItem name={`border.border.${activeBorder}.width`} label="Width" jsSetting>
                            <Input
                                addonAfter={
                                    addOnAfter
                                }
                                value={value?.border?.[activeBorder]?.width}
                            />
                        </SettingsFormItem>
                    </div>
                    <div style={{ flex: '1 1 100px', minWidth: '100px' }}>
                        <SettingsFormItem name={`border.border.${activeBorder}.color`} label="Color" jsSetting>
                            <ColorPicker
                                allowClear
                                value={value?.border?.[activeBorder]?.color || '#000000'}
                            />
                        </SettingsFormItem>
                    </div>
                </div>
                <Col className="gutter-row" span={24}>
                    {renderRadioGroup(styleOptions, activeBorder, 'border', 'style')}
                </Col>
            </Col>
        </Row>
    );
};

export default BorderComponent;