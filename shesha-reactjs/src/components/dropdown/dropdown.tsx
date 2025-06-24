import React, { FC, useCallback } from 'react';
import ReadOnlyDisplayFormItem, { Icon } from '@/components/readOnlyDisplayFormItem';
import { executeExpression } from '@/providers/form/utils';
import { IDropdownProps, ILabelValue } from './model';
import { Select } from 'antd';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { IncomeValueFunc, ISelectOption, OutcomeValueFunc } from '@/components/refListDropDown/models';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { useStyles } from './style';
import { getTagStyle } from '@/utils/style';
import ReflistTag from '../refListDropDown/reflistTag';


export const Dropdown: FC<IDropdownProps> = ({
    valueFormat,
    incomeCustomJs,
    outcomeCustomJs,
    labelCustomJs,
    dataSourceType,
    values,
    onChange,
    value,
    referenceListId,
    mode,
    defaultValue,
    disableItemValue = false,
    ignoredValues = [],
    disabledValues = [],
    placeholder,
    readOnly,
    style,
    size,
    showIcon,
    solidColor = true,
    showItemName,
    allowClear = true,
    displayStyle,
    tagStyle
}) => {

    const { styles } = useStyles({ style });

    const selectedMode = mode === 'multiple' || mode === 'tags' ? mode : undefined;

    const getOptions = (): ILabelValue[] => {
        return value && typeof value === 'number' ? values?.map((i) => ({ ...i, value: parseInt(i.value, 10) })) : values;
    };

    const incomeValueFunc: IncomeValueFunc = useCallback((value: any, args?: any) => {
        if (valueFormat === 'listItem') {
            return !!value ? value.itemValue : null;
        }
        if (valueFormat === 'custom') {
            return executeExpression<string>(incomeCustomJs, { ...args, value }, null, null);
        }
        return value;
    }, [valueFormat, incomeCustomJs]);

    const outcomeValueFunc: OutcomeValueFunc = useCallback((value: ReferenceListItemDto, args?: any) => {
        if (valueFormat === 'listItem') {
            return !!value
                ? { item: value.item, itemValue: value.itemValue }
                : null;
        }
        if (valueFormat === 'custom') {
            return executeExpression(outcomeCustomJs, { ...args, value }, null, null);
        }
        return !!value ? value.itemValue : null;
    }, [valueFormat, outcomeCustomJs]);

    const getLabeledValue = useCallback((value: any, options: ISelectOption<any>[]) => {
        if (typeof value === 'undefined' || value === null)
            return value;
        const itemValue = incomeValueFunc(value, {});
        const item = options?.find(i => i.value === itemValue);
        return {
            // fix for designer when switch mode
            value: typeof itemValue === 'object' ? null : itemValue,
            label: item?.label ?? 'unknown',
            color: item?.color,
            icon: item?.icon,
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
            color: fetchedItem?.color,
            icon: fetchedItem?.icon,
        };
    }, [labelCustomJs, outcomeValueFunc, incomeValueFunc]);

    if (dataSourceType === 'referenceList') {
        return (
            <GenericRefListDropDown<any>
                onChange={onChange}
                referenceListId={referenceListId}
                value={value}
                variant={'borderless'}
                defaultValue={defaultValue}
                mode={selectedMode}
                disabledValues={disableItemValue ? disabledValues : []}
                filters={ignoredValues}
                placeholder={placeholder}
                readOnly={readOnly}
                size={size}
                showIcon={showIcon}
                solidColor={solidColor}
                showItemName={showItemName}
                className={styles.dropdown}
                style={{ ...style }}
                tagStyle={tagStyle}
                allowClear={allowClear}
                getLabeledValue={getLabeledValue}
                getOptionFromFetchedItem={getOptionFromFetchedItem}
                displayStyle={displayStyle}
                incomeValueFunc={incomeValueFunc}
                outcomeValueFunc={outcomeValueFunc}
            />
        );
    }

    const options = getOptions() || [];

    const selectedValue = options.length > 0 ? value ?? defaultValue : null;

    const getSelectValue = () => {
        const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
        return options?.filter(({ value: currentValue }) => selectedValues.indexOf(currentValue) > -1)?.map(({ label }) => ({ label }));
    };

    if (readOnly) {
        return <ReadOnlyDisplayFormItem
            showIcon={showIcon}
            solidColor={solidColor}
            showItemName={showItemName}
            style={displayStyle === 'tags' ? tagStyle : style}
            dropdownDisplayMode={displayStyle === 'tags' ? 'tags' : 'raw'}
            type={mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
            value={mode === 'multiple' ?
                displayStyle === 'tags' ?
                    selectedValue?.map(x => options.find((o) => o.value === x)) :
                    getSelectValue() :
                options.find((o) => o.value === selectedValue)}
        />;
    }

    const commonSelectProps = {
        allowClear,
        onChange,
        value: selectedValue,
        defaultValue,
        variant: 'borderless' as 'borderless' | 'filled' | 'outlined',
        disabled: readOnly,
        mode: selectedMode,
        placeholder,
        size
    };

    if (displayStyle === 'tags' && mode !== 'multiple') {
        return <Select
            {...commonSelectProps}
            popupMatchSelectWidth={false}
            style={{ width: 'max-content', height: 'max-content' }}
            placeholder={placeholder && <ReflistTag
                key={'placeholder'}
                color={'#d9d9d9'}
                showItemName={showItemName}
                label={placeholder ?? <span style={{ whiteSpace: 'pre' }}>{'      '}</span>}
            />}
            labelRender={(props) => {
                const option = options.find((o) => o.value === props.value);
                return <ReflistTag
                    key={props.value}
                    color={option?.color}
                    showItemName={showItemName}
                    label={showItemName && option?.label}
                    icon={((option?.icon && showIcon)) && <Icon type={option?.icon} />}
                    tagStyle={getTagStyle(tagStyle, !!option?.color && solidColor)}
                />;
            }}
        >
            {
                options.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                        {option?.label}
                    </Select.Option>
                ))
            }
        </Select >;
    };

    return (
        <Select
            {...commonSelectProps}
            className={styles.dropdown}
            showSearch
            style={{ ...style }}
            {...(displayStyle === 'tags' ? {
                labelRender: (props) => {
                    const option = options.find((o) => o.value === props.value);
                    return <ReflistTag
                        key={props.value}
                        color={option?.color}
                        showItemName={showItemName}
                        icon={option?.icon && showIcon && <Icon type={option?.icon} />}
                        tagStyle={getTagStyle(tagStyle, !!option?.color && solidColor)}
                        label={showItemName && option?.label}
                    />;
                }
            } : {})}
        >
            {options.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                    {option.label}
                </Select.Option>
            ))}
        </Select>
    );
}; 