import { Col, InputNumber, Radio, Row, Select } from 'antd';
import React, { FC } from 'react';
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { ColorPicker } from '@/components';
import { IFontValue } from './interfaces';
import { useStyles } from '../../styles/styles';

const { Option } = Select;

const fontTypes = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
    'Arial Black', 'Impact',
];

const fontWeights = [
    { value: 100, title: 'thin' },
    { value: 200, title: 'extra-light' },
    { value: 300, title: 'light' },
    { value: 400, title: 'normal' },
    { value: 500, title: 'medium' },
    { value: 600, title: 'semi-bold' },
    { value: 700, title: 'bold' },
    { value: 800, title: 'extra-bold' },
    { value: 900, title: 'black' },
];


const alignOptions = [
    { value: 'left', icon: <AlignLeftOutlined />, title: 'Left' },
    { value: 'center', icon: <AlignCenterOutlined />, title: 'Center' },
    { value: 'right', icon: <AlignRightOutlined />, title: 'Right' },
];

interface IDropdownProps {
    updateValue: (newValue: Partial<IFontValue>) => void;
    value: IFontValue;
    options: any[];
    field: string;
    labelField?: string;
    valueField?: string;
}

const Dropdown: FC<IDropdownProps> = ({ updateValue, value, options, field, labelField = 'title', valueField = 'value' }) => (
    <Select
        value={value?.[field]}
        onChange={(newValue) => updateValue({ [field]: newValue })}
    >
        {options.map(option => (
            <Option key={option[valueField]} value={option[valueField]}>
                {field === 'weight' ? option.value + ' ' + option.title : option[labelField]}
            </Option>
        ))}
    </Select>
);


export interface IFontType {
    onChange?: (value: any) => void;
    value?: IFontValue;
    readOnly?: boolean;
    model?: any;
}

const FontComponent: FC<IFontType> = ({ onChange, readOnly, value, model }) => {
    const { styles } = useStyles()
    const updateValue = (newValue: Partial<IFontValue>) => {
        const updatedValue = { ...model, font: { ...value, ...newValue } };
        onChange(updatedValue);
    };

    const renderSizeInput = (property, label) => {
        const currentValue = value?.[property];

        return (
            <SettingsFormItem name={`font.${property}`} label={label} jsSetting>
                <InputNumber
                    value={currentValue}
                    readOnly={readOnly}
                />
            </SettingsFormItem>
        );
    };

    const renderInputRow = (inputs: Array<{ label: string, property }>) => (
        <div className={styles.flexWrapper}>
            {inputs.map(({ label, property }) => (
                <div key={property} className={styles.flexInput}>
                    {renderSizeInput(property, label)}
                </div>
            ))}
        </div>
    );

    return (
        <Row gutter={[8, 2]} style={{ fontSize: '11px' }}>
            {renderInputRow([{ label: 'Size', property: 'size' }, { label: 'Line Height', property: 'lineHeight' }])}
            <div className={styles.flexWrapper}>
                <div className={styles.flexInput}>
                    <SettingsFormItem name="font.color" label="Color" jsSetting>
                        <ColorPicker value={value?.color} readOnly={readOnly} allowClear />
                    </SettingsFormItem>
                </div>
                <div className={styles.flexInput}>
                    <SettingsFormItem readOnly={readOnly} name="font.align" label="Align" jsSetting>
                        <Radio.Group value={value?.align} onChange={(e) => updateValue({ align: e.target.value })}>
                            {alignOptions.map(({ value, icon, title }) => (
                                <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                            ))}
                        </Radio.Group>
                    </SettingsFormItem>
                </div>
            </div>
            <Col className="gutter-row" span={24}>
                <SettingsFormItem name="font.weight" label="Weight" jsSetting>
                    <Dropdown updateValue={updateValue} value={value} options={fontWeights} field="weight" labelField={null} />
                </SettingsFormItem>
            </Col>
            <Col className="gutter-row" span={24}>
                <SettingsFormItem name="font.type" label="Family" jsSetting>
                    <Dropdown updateValue={updateValue} value={value} options={fontTypes.map(type => ({ value: type }))} field="type" />
                </SettingsFormItem>
            </Col>
        </Row>
    );
};

export default FontComponent;