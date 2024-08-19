import React, { FC, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Input, Select, Space } from 'antd';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { IBackgroundValue } from './interfaces';

type SizeAndRepeatProps = {
    updateValue: (value: Partial<IBackgroundValue>) => void;
    backgroundSize: IBackgroundValue['size'];
    backgroundPosition: IBackgroundValue['position'];
    backgroundRepeat: IBackgroundValue['repeat'];
    readOnly?: boolean;
};

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];
const { Option } = Select;

const SizeAndRepeat: FC<SizeAndRepeatProps> = ({ updateValue, backgroundSize, backgroundPosition, backgroundRepeat, readOnly }) => {
    const defaultSizes = ['cover', 'contain', 'auto'];
    const defaultPositions = ['center', 'top', 'left', 'right', 'bottom', 'top left', 'top right', 'bottom left', 'bottom right'];

    const [sizes, setSizes] = useState<string[]>([...defaultSizes]);
    const [positions, setPositions] = useState<string[]>([...defaultPositions]);

    useEffect(() => {
        if (backgroundSize && !sizes.includes(backgroundSize)) {
            setSizes(() => [...defaultSizes, backgroundSize]);
        }
        if (backgroundPosition && !positions.includes(backgroundPosition)) {
            setPositions(() => [...defaultPositions, backgroundPosition]);
        }
    }, [backgroundSize, backgroundPosition]);

    const [size, setSize] = useState({ width: { value: '', unit: 'px' }, height: { value: '', unit: 'px' } });
    const [position, setPosition] = useState({ width: { value: '', unit: 'px' }, height: { value: '', unit: 'px' } });


    const clearInputs = (type: 'size' | 'position') => {
        const emptyState = { width: { value: '', unit: 'px' }, height: { value: '', unit: 'px' } };
        if (type === 'size')
            setSize(emptyState);
        else setPosition(emptyState);
    };

    const addItem = (type: 'size' | 'position') => {
        const { width, height } = type === 'size' ? size : position;
        const newValue = `${width.value}${width.unit} ${height.value}${height.unit}`;

        if (type === 'size') {
            if (!sizes.includes(newValue)) {
                setSizes(() => [...defaultSizes, newValue]);
            }
            updateValue({ size: newValue });
        } else {
            if (!positions.includes(newValue)) {
                setPositions(() => [...defaultPositions, newValue]);
            }
            updateValue({ position: newValue });
        }

        clearInputs(type);
    };

    const renderOptions = (menu, value, setValue, label: 'size' | 'position') => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }} onClick={(e) => e.stopPropagation()}>
                <Space.Compact size="large">
                    {['width', 'height'].map((dim) => (
                        <Input
                            key={dim}
                            addonAfter={
                                <Select
                                    value={value[dim].unit}
                                    disabled={readOnly}
                                    onChange={(unit) => setValue(prev => ({ ...prev, [dim]: { ...prev[dim], unit } }))}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                                </Select>
                            }
                            readOnly={readOnly}
                            value={value[dim].value}
                            onChange={(e) => setValue(prev => ({ ...prev, [dim]: { ...prev[dim], value: e.target.value } }))}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ))}
                </Space.Compact>
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        addItem(label);
                    }}
                    disabled={readOnly}
                >
                    Apply {label}
                </Button>
            </Space>
        </>
    );

    return (
        <>
            {[
                { name: 'size', label: 'Size', value: backgroundSize, options: sizes, state: size, setState: setSize },
                { name: 'position', label: 'Position', value: backgroundPosition, options: positions, state: position, setState: setPosition },
                {
                    name: 'repeat', label: 'Repeat', value: backgroundRepeat, options: [
                        { label: 'No repeat', value: 'no-repeat' },
                        { label: 'Repeat', value: 'repeat' },
                        { label: 'Repeat X', value: 'repeat-x' },
                        { label: 'Repeat Y', value: 'repeat-y' },
                    ]
                }
            ].map(({ name, label, value, options, state, setState }) => (
                <Col key={name} span={24} style={{ fontSize: '11px' }}>
                    <SettingsFormItem name={`background.${name}`} readOnly={readOnly} label={label} jsSetting>
                        <Select
                            value={value || (name === 'repeat' ? 'no-repeat' : 'auto')}
                            disabled={readOnly}
                            onChange={(newValue) => {
                                updateValue({ [name]: newValue });
                                if (name !== 'repeat') clearInputs(name as 'size' | 'position');
                            }}
                            dropdownRender={name !== 'repeat' ? (menu) => renderOptions(menu, state, setState, name as 'size' | 'position') : undefined}
                            options={options.map((item) => typeof item === 'string' ? { label: item, value: item } : item)}
                        />
                    </SettingsFormItem>
                </Col>
            ))}
        </>
    );
};

export default SizeAndRepeat;