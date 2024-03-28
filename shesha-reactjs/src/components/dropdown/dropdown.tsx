import React, { FC, useCallback } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { evaluateString, executeExpression } from '@/providers/form/utils';
import { IDropdownProps, ILabelValue } from './model';
import { Select } from 'antd';
import {
    useForm,
    useFormData,
    useGlobalState,
} from '@/providers';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { IncomeValueFunc, ISelectOption, OutcomeValueFunc } from '@/components/refListDropDown/models';
import { ReferenceListItemDto } from '@/apis/referenceList';


export const Dropdown: FC<IDropdownProps> = ({
    valueFormat,
    incomeCustomJs,
    outcomeCustomJs,
    labelCustomJs,

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
    readOnly,
    style,
    size,
    allowClear = true,
}) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const selectedMode = mode === 'single' ? undefined : mode;

    //quick fix not to default to empty string or null while working with multi-mode
    const defaultValue = evaluateString(defaultVal, { formData, formMode, globalState }) || undefined;

    const value = (evaluateString(val, { formData, formMode, globalState }) || undefined) as any;

    const getOptions = (): ILabelValue[] => {
        return value && typeof value === 'number' ? values?.map((i) => ({ ...i, value: parseInt(i.value, 10) })) : values;
    };

    const incomeValueFunc: IncomeValueFunc = useCallback((value: any, args?: any) => {
        if (valueFormat === 'listItem') {
            return !!value ? value.itemValue : null;
        }
        if (valueFormat === 'custom') {
            return executeExpression<string>(incomeCustomJs, {...args, value}, null, null );
        }
        return value;
    }, [valueFormat, incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value: ReferenceListItemDto, args?: any) => {
        if (valueFormat === 'listItem') {
            return !!value
              ? {item: value.item, itemValue: value.itemValue}
              : null;
        }
        if (valueFormat === 'custom') {
            return executeExpression(outcomeCustomJs, {...args, value}, null, null );
        }
        return !!value ? value.itemValue : null;
    }, [valueFormat, outcomeCustomJs]);

    const getLabeledValue = useCallback((value: any, options: ISelectOption<any>[]) => {
        if (value === undefined) 
            return undefined;
        const itemValue = incomeValueFunc(value, {});
        const item = options?.find(i => i.value === itemValue);
        return {
            // fix for designer when switch mode
            value: typeof itemValue === 'object' ? null : itemValue,
            label: item?.label ?? 'unknown',
            data: item?.data,
        };
    }, [incomeValueFunc]);

    const getOptionFromFetchedItem = useCallback((fetchedItem: ReferenceListItemDto, args?: any): ISelectOption<any> => {
        const label = (!!labelCustomJs
            ? executeExpression<string>(
                labelCustomJs,
                { value: fetchedItem },
                null,
                (e) => {
                    console.error(e);
                    return 'unknown';
                }
            )
            : fetchedItem.item);

        const value = incomeValueFunc(outcomeValueFunc(fetchedItem, args), {});

        return {
            // fix for designer when switch mode
            value: typeof value === 'object' ? null : value,
            label,
            data: outcomeValueFunc(fetchedItem, args),
        };
    }, [labelCustomJs, outcomeValueFunc, incomeValueFunc]);

    if (dataSourceType === 'referenceList') {
        return (
            <GenericRefListDropDown<any>
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
                style={style}
                allowClear={allowClear} 
                
                getLabeledValue={getLabeledValue}
                getOptionFromFetchedItem={getOptionFromFetchedItem}

                incomeValueFunc={incomeValueFunc}
                outcomeValueFunc={outcomeValueFunc}
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
            style={style}
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