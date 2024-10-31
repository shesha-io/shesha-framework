import React, { FC, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Select, Space } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IDropdownOption } from '@/designer-components/styleBackground/interfaces';

const { Option } = Select;

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];

interface CustomDropdownProps {
    value: string;
    options: Array<string | IDropdownOption>;
    readOnly?: boolean;
    label?: string | React.ReactNode;
    size?: SizeType;
    onAddCustomOption?: (newOption: string) => void;
    onChange?: (value: string) => void;
    variant?: 'borderless' | 'outlined' | 'filled';
}

const CustomDropdown: FC<CustomDropdownProps> = ({
    value,
    options,
    readOnly,
    label,
    onChange,
    size
}) => {
    const [customOption, setCustomOption] = useState({ width: { value: '', unit: 'px' }, height: { value: '', unit: 'px' } });
    const [customOptions, setCustomOptions] = useState(options);

    const clearInputs = () => {
        setCustomOption({ width: { value: '', unit: 'px' }, height: { value: '', unit: 'px' } });
    };

    const addCustomOption = () => {
        const { width, height } = customOption;
        const newValue = `${width.value}${width.unit} ${height.value}${height.unit}`;
        setCustomOptions(prev => [...prev, newValue]);
        clearInputs();
    };

    const renderCustomOptionInput = () => (
        <>
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }} onClick={(e) => e.stopPropagation()}>
                <Space.Compact size="large">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px', width: '100%' }}>
                        {['width', 'height'].map((dim) => (
                            <div key={dim} style={{ flex: '1 1 100px', minWidth: '100px' }}>
                                <Input
                                    prefix={dim === 'width' ? 'x : ' : 'y : '}
                                    addonAfter={
                                        <Select
                                            value={customOption[dim].unit}
                                            disabled={readOnly}
                                            onChange={(unit) => setCustomOption(prev => ({ ...prev, [dim]: { ...prev[dim], unit } }))}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            dropdownStyle={{ width: '70px' }}
                                        >
                                            {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                                        </Select>
                                    }
                                    readOnly={readOnly}
                                    value={customOption[dim].value}
                                    onChange={(e) => setCustomOption(prev => ({ ...prev, [dim]: { ...prev[dim], value: e.target.value } }))}
                                    size='small'
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        ))}
                    </div>
                </Space.Compact>
                <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={addCustomOption}
                    disabled={readOnly}
                >
                    Apply {label}
                </Button>
            </Space>
        </>
    );

    return (
        <Select
            value={value}
            disabled={readOnly}
            size={size}
            onChange={onChange}
            dropdownRender={(menu) => (
                <>
                    {menu}
                    {renderCustomOptionInput()}
                </>
            )}
            options={customOptions.map((item) => typeof item === 'string' ? { label: item, value: item } : item)}
        />
    );
};

export default CustomDropdown;
