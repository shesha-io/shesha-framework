import { Col, Input, InputNumber, Row, Select, Switch } from 'antd';
import React, { FC } from 'react';
import { BorderBottomOutlined, BorderLeftOutlined, BorderOutlined, BorderRightOutlined, BorderTopOutlined, CloseOutlined, DashOutlined, ExpandOutlined, MinusOutlined, RadiusBottomleftOutlined, RadiusBottomrightOutlined, RadiusUpleftOutlined, RadiusUprightOutlined, SmallDashOutlined } from '@ant-design/icons';
import { ColorPicker } from '@/components';
import { IBorderValue } from './interfaces';
import FormItem from '@/designer-components/_settings/components/formItem';
import { SettingsRadioGroup } from '@/designer-components/_settings/components/utils';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

interface IBorderProps {
    value?: IBorderValue;
    readOnly?: boolean;
    model?: any;
    onChange?: (value: IBorderValue) => void;
}

const BorderComponent: FC<IBorderProps> = ({ model, readOnly, value: valued, onChange }) => {

    console.log("Border:::", model, readOnly, valued, onChange);
    const value = model?.border || {};

    const activeBorder = value?.activeBorder || 'all';
    const activeRadius = value?.activeRadius || 'all';
    const hideBorder = model?.hideBorder || false;

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
        { value: 'none', icon: <CloseOutlined /> },
    ];

    const addOnAfter = (
        <Select
            value={value?.border?.[activeBorder]?.unit || 'px'}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
        </Select>
    );

    return (
        <Row gutter={[8, 2]}>
            <Col className="gutter-row" span={24}>
                <FormItem name="hideBorder" label="Hide Border" valuePropName="checked" jsSetting orientation='horizontal'>
                    <Switch disabled={readOnly} onChange={() => { console.log("Border:::", value) }} />
                </FormItem>
            </Col>
            {!hideBorder && <>
                <Col className="gutter-row" span={24}>
                    {SettingsRadioGroup({ options: radiusOptions, value: activeRadius, type: 'Radius', name: `border.activeRadius` })}
                </Col>
                <Col className="gutter-row" span={24}>
                    <FormItem name={`border.radius.${activeRadius}`} label='Degrees' jsSetting>
                        <InputNumber
                            min={0}
                            max={100}
                            value={value?.radius?.[activeRadius]}
                        />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={24}>
                    {SettingsRadioGroup({ options: borderOptions, value: activeBorder, type: 'Border', name: `border.active.${value?.activeBorder}` })}
                </Col>
                <Col className="gutter-row" span={24}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ flex: '1 1 100px', minWidth: '100px' }}>
                            <FormItem name={`border.border.${activeBorder}.width`} label="Width" jsSetting>
                                <Input
                                    addonAfter={addOnAfter}
                                    value={value?.border?.[activeBorder]?.width}
                                />
                            </FormItem>
                        </div>
                        <div style={{ flex: '1 1 100px', minWidth: '100px' }}>
                            <FormItem name={`border.border.${activeBorder}.color`} label="Color" jsSetting>
                                <ColorPicker
                                    allowClear
                                    value={value?.border?.[activeBorder]?.color || '#000000'}
                                />
                            </FormItem>
                        </div>
                    </div>
                </Col>
                <Col className="gutter-row" span={24}>
                    {SettingsRadioGroup({ options: styleOptions, value: activeBorder, type: 'Border', name: `border.active.${value?.activeBorder}` })}
                </Col>
            </>}
        </Row>
    );
};

export default BorderComponent;