import React, { FC } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import RefListDropDown from '@/components/refListDropDown';
import { evaluateString } from '@/providers/form/utils';
import { getStyle } from '@/providers/form/utils';
import { IDropdownComponentProps, ILabelValue } from './interfaces';
import { Select } from 'antd';
import {
    useForm,
    useFormData,
    useGlobalState,
} from '@/providers';

export const Dropdown: FC<IDropdownComponentProps> = ({
    dataSourceType,
    values,
    onChange,
    value: val,
    hideBorder,
    referenceListId,
    mode,
    defaultValue: defaultVal,
    ignoredValues = [],
    placeholder,
    useRawValues,
    readOnly,
    style,
    size,
    allowClear = true,
}) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const selectedMode = mode === 'single' ? undefined : mode;

    const localStyle = getStyle(style, formData);

    //quick fix not to default to empty string or null while working with multi-mode
    const defaultValue = evaluateString(defaultVal, { formData, formMode, globalState }) || undefined;

    const value = (evaluateString(val, { formData, formMode, globalState }) || undefined) as any;

    const getOptions = (): ILabelValue[] => {
        return value && typeof value === 'number' ? values?.map((i) => ({ ...i, value: parseInt(i.value, 10) })) : values;
    };

    if (dataSourceType === 'referenceList') {
        return useRawValues ? (
            <RefListDropDown.Raw
                onChange={onChange}
                referenceListId={referenceListId}
                value={value}
                variant={hideBorder ? 'borderless' : undefined}
                defaultValue={defaultValue}
                mode={selectedMode}
                filters={ignoredValues}
                includeFilters={false}
                placeholder={placeholder}
                readOnly={readOnly}
                size={size}
                style={localStyle}
                allowClear={allowClear}
            />
        ) : (
            <RefListDropDown.Dto
                onChange={onChange}
                referenceListId={referenceListId}
                value={value}
                variant={hideBorder ? 'borderless' : undefined}
                defaultValue={defaultValue}
                mode={selectedMode}
                filters={ignoredValues}
                includeFilters={false}
                placeholder={placeholder}
                readOnly={readOnly}
                size={size}
                style={localStyle}
                allowClear={allowClear}
            />
        );
    }

    const options = getOptions() || [];

    const selectedValue = options.length > 0 ? value || defaultValue : null;

    const getSelectValue = () => {
        return options?.find(({ value: currentValue }) => currentValue === selectedValue)?.label;
    };

    if (readOnly) {
        return <ReadOnlyDisplayFormItem type="string" value={getSelectValue()} />;
    }

    return (
        <Select
            allowClear={allowClear}
            onChange={onChange}
            value={options.length > 0 ? value || defaultValue : undefined}
            defaultValue={defaultValue}
            variant={hideBorder ? 'borderless' : undefined}
            disabled={readOnly}
            mode={selectedMode}
            placeholder={placeholder}
            showSearch
            size={size}
        >
            {options.map((option, index) => (
                <Select.Option key={index} value={option.value}>
                    {option.label}
                </Select.Option>
            ))}
        </Select>
    );
}; 