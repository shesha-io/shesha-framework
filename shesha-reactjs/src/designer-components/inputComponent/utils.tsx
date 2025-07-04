import React from 'react';
import { Select, Row } from 'antd';
import { CodeEditor, ListEditor } from '@/components';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { ILabelValueEditorProps, ILabelValueItem } from '@/components/labelValueEditor/labelValueEditor';
import { InputComponent } from '.';
import { useStyles } from './styles';
import { getWidth } from '../settingsInput/utils';
import { IDropdownOption, InputType } from '../settingsInput/interfaces';
export const getEditor = (availableConstantsExpression: string, codeEditorProps: any, constantsAccessor: any) => {
    return availableConstantsExpression?.trim()
        ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} />
        : <CodeEditorWithStandardConstants {...codeEditorProps} />;
};

interface InputPropertyEditorProps {
    item: Record<string, any>;
    propertyName: string;
    itemOnChange: (item: any, index: any) => void;
    placeholder?: string;
    type: InputType['type'];
    dropdownOptions?: IDropdownOption[] | string;
    readOnly?: boolean;
}
const InputPropertyEditor = (props: InputPropertyEditorProps) => {
    const { item, propertyName, itemOnChange, placeholder, type, dropdownOptions = [], readOnly } = props;
    return (
        type === 'dropdown' ?
            <Select
                size='small'
                variant='borderless'
                showSearch
                value={item[propertyName]}
                onChange={(value) => {
                    itemOnChange({ ...item, [propertyName]: value }, undefined);
                }}
                popupMatchSelectWidth={false}
                style={{ width: 'max-content' }}
                labelRender={() => {
                    return '';
                }}
                disabled={readOnly}
            >
                {Array.isArray(dropdownOptions) ? dropdownOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                        {option.label}
                    </Select.Option>
                )) : dropdownOptions}
            </Select> :
            <InputComponent
                type={type}
                placeholder={placeholder}
                title={placeholder}
                size='small'
                label=''
                id={propertyName}
                propertyName={propertyName}
                value={item[propertyName]}
                iconSize={16}
                width={getWidth(type, type === 'iconPicker' || type === 'colorPicker' ? 24 : 100)}
                onChange={(value) => {
                    itemOnChange({ ...item, [propertyName]: value }, undefined);
                }}
                dropdownOptions={dropdownOptions}
            />
    );
};
export const CustomLabelValueEditorInputs = (props: ILabelValueEditorProps) => {
    const { styles } = useStyles();
    const { value, onChange, labelName, valueName, readOnly, labelTitle, valueTitle, colorName, iconName, colorTitle, iconTitle, dropdownOptions } = props;

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
            <div className={styles.rowInputs} style={{ gap: 8 }}>
                <InputPropertyEditor type='textField' item={item} itemOnChange={itemOnChange} propertyName={labelName} readOnly={readOnly} placeholder={labelTitle} />
                <InputPropertyEditor type='textField' item={item} itemOnChange={itemOnChange} propertyName={valueName} readOnly={readOnly} placeholder={valueTitle} />
                <Row>
                    <InputPropertyEditor type='colorPicker' item={item} itemOnChange={itemOnChange} propertyName={colorName} readOnly={readOnly} placeholder={colorTitle} />
                    <InputPropertyEditor type='dropdown' dropdownOptions={dropdownOptions} item={item} itemOnChange={itemOnChange} propertyName={colorName} readOnly={readOnly} placeholder={colorTitle} />
                </Row>
                <InputPropertyEditor type='iconPicker' item={item} itemOnChange={itemOnChange} propertyName={iconName} readOnly={readOnly} placeholder={iconTitle} />
            </div>)
        }
    </ListEditor>;
};
