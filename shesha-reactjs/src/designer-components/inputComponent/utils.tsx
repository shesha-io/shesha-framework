import React from 'react';
import { Tooltip, Space, Row, Col } from 'antd';
import { ShaIcon, IconType, SectionSeparator, CodeEditor, ListEditor } from '@/components';
import { customIcons } from './icons';
import { startCase } from 'lodash';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { ILabelValueEditorProps, ILabelValueItem } from '@/components/labelValueEditor/labelValueEditor';
import { InputComponent } from '.';

export const iconElement = (
    icon: string | React.ReactNode,
    size?: any,
    hint?: string,
    style?: React.CSSProperties,
    styles?: any,
    propertyName?: string
) => {
    const icons = require('@ant-design/icons');

    if (typeof icon !== 'string') {
        return icon;
    }

    if (icons[icon]) {
        return (
            <Tooltip title={hint}>
                <ShaIcon iconName={icon as IconType} style={style} />
            </Tooltip>
        );
    }

    if (customIcons[icon]) {
        return (
            <Tooltip title={hint ?? startCase(propertyName?.split('.')[1])}>
                <span style={style}>{customIcons[icon]}</span>
            </Tooltip>
        );
    }

    if (icon === 'sectionSeparator') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                verticalAlign: 'middle',
                top: 10
            }}>
                <Space>
                    {size}
                    <Tooltip className={styles.icon} title={hint}>
                        <SectionSeparator
                            containerStyle={{ margin: 0 }}
                            lineThickness={Number(size[0]) / 2}
                            lineWidth='20'
                            lineColor='#000'
                            fontSize={14}
                            marginBottom='0px'
                        />
                    </Tooltip>
                </Space>
            </div>
        );
    }

    return icon;
};

export const editModes = [
    { value: 'editable', icon: 'editIcon', title: 'Editable' },
    { value: 'readOnly', icon: 'readonlyIcon', title: 'Read only' },
    { value: 'inherited', icon: 'inheritIcon', title: 'Inherit' }
];

export const getEditor = (availableConstantsExpression: string, codeEditorProps: any, constantsAccessor: any) => {
    return availableConstantsExpression?.trim()
        ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} />
        : <CodeEditorWithStandardConstants {...codeEditorProps} />;
};

const InputPropertyEditor = (props) => {
    const { item, propertyName, itemOnChange, placeholder, type } = props;
    return (
        <InputComponent
            type={type}
            placeholder={placeholder}
            title={placeholder}
            size='small'
            label=''
            id={propertyName}
            propertyName={propertyName}
            value={item[propertyName]}
            onChange={(e) => {
                itemOnChange({ ...item, [propertyName]: e?.target?.value ?? e }, undefined);
            }}
        />
    );
};
export const CustomLabelValueEditorInputs = (props: ILabelValueEditorProps) => {
    const { value, onChange, labelName, valueName, readOnly, labelTitle, valueTitle, colorName, iconName, colorTitle, iconTitle } = props;

    return <ListEditor<ILabelValueItem>
        value={value}
        onChange={onChange}
        initNewItem={(_items) => ({
            [labelName]: '',
            [valueName]: '',
            [colorName]: '',
            [iconName]: '',
        })
        }
        readOnly={readOnly}
    >
        {({ item, itemOnChange, readOnly }) => (
            <Row gutter={4}>
                <Col span={7}>
                    <InputPropertyEditor type='textField' item={item} itemOnChange={itemOnChange} propertyName={labelName} readOnly={readOnly} placeholder={labelTitle} />
                </Col>
                <Col span={7}>
                    <InputPropertyEditor type='textField' item={item} itemOnChange={itemOnChange} propertyName={valueName} readOnly={readOnly} placeholder={valueTitle} />
                </Col>
                <Col span={7}>
                    <InputPropertyEditor type='colorPicker' item={item} itemOnChange={itemOnChange} propertyName={colorName} readOnly={readOnly} placeholder={colorTitle} />
                </Col>
                <Col span={3}>
                    <InputPropertyEditor type='iconPicker' item={item} itemOnChange={itemOnChange} propertyName={iconName} readOnly={readOnly} placeholder={iconTitle} />
                </Col>
            </Row>)
        }
    </ListEditor>;
};
