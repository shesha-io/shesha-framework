import { Input, Radio, Row, Select } from 'antd';
import React, { FC } from 'react';
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { ColorPicker } from '@/components';
import { IFontValue } from './interfaces';
import { useStyles } from '../../styles/styles';

const { Option } = Select;

const fontTypes = [
    { value: 'Arial', title: 'Arial' },
    { value: 'Helvetica', title: 'Helvetica' },
    { value: 'Times New Roman', title: 'Times New Roman' },
    { value: 'Courier New', title: 'Courier New' },
    { value: 'Verdana', title: 'Verdana' },
    { value: 'Georgia', title: 'Georgia' },
    { value: 'Palatino', title: 'Palatino' },
    { value: 'Garamond', title: 'Garamond' },
    { value: 'Comic Sans MS', title: 'Comic Sans MS' },
    { value: 'Trebuchet MS', title: 'Trebuchet MS' },
    { value: 'Arial Black', title: 'Arial Black' },
    { value: 'impact', title: 'Impact' },
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

const Dropdown: FC<IDropdownProps> = ({ updateValue, value, options, field: property, valueField = 'value' }) => (
    <Select
        value={value?.[property]}
        onChange={(newValue) => {
            updateValue({ [property]: newValue })
        }}
    >
        {options.map(option => (
            <Option key={option[valueField]} value={option[valueField]}>
                {property === 'weight' ? option.value + ' ' + option.title : option.value}
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

    const renderInput = (props) => {
        const { label, property, type, options } = props;
        const currentValue = value?.[property];

        const input = () => {
            switch (type) {
                case 'color':
                    return <ColorPicker value={value?.color} readOnly={readOnly} allowClear />;
                case 'dropdown':
                    return <Dropdown updateValue={updateValue} value={value} options={options} field={property} />;
                case 'buttons':
                    return <Radio.Group value={value?.align} onChange={(e) => updateValue({ align: e.target.value })}>
                        {alignOptions.map(({ value, icon, title }) => (
                            <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                        ))}
                    </Radio.Group>
                default:
                    return <Input
                        value={currentValue}
                        readOnly={readOnly}
                    />;
            }
        }

        return (
            <SettingsFormItem name={`font.${property}`} label={label} jsSetting>
                {input()}
            </SettingsFormItem>
        );
    };

    const renderInputRow = (inputs: Array<{ label: string, property, type?: 'color' | 'dropdown' | 'buttons', options?, field?}>) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px', width: '100%' }}>
            {inputs.map((props) => (
                <div key={props.property} style={{ flex: '1 1 100px', minWidth: '100px' }}>
                    {renderInput(props)}
                </div>
            ))}
        </div>
    );

    return (
        <Row gutter={[8, 2]}>
            {renderInputRow([{ label: 'Size', property: 'size' }, { label: 'Font Weight', property: 'weight', type: 'dropdown', options: fontWeights }])}
            {renderInputRow([{ label: 'Color', property: 'color', type: 'color' }, { label: 'Family', property: 'type', type: 'dropdown', options: fontTypes }])}
            {renderInputRow([{ label: 'Align', property: 'align', type: 'buttons', options: alignOptions }])}

        </Row>
    );
};

export default FontComponent;