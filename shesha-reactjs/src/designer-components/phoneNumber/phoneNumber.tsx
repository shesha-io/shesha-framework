import { PhoneOutlined } from '@ant-design/icons';
import React, { CSSProperties, useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { FormMarkup, IInputStyles } from '@/providers/form/models';
import { evaluateString, getStyle, pickStyleFromModel, useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IPhoneNumberInputComponentProps, IPhoneNumberValue } from './interface';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import PhoneInput from 'antd-phone-input';
import settingsFormJson from './settingsForm.json';
import { removeUndefinedProps } from '@/utils/object';

const settingsForm = settingsFormJson as FormMarkup;

const PhoneNumberInputComponent: IToolboxComponent<IPhoneNumberInputComponentProps> = {
    type: 'phoneNumberInput',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    name: 'Phone Number',
    icon: <PhoneOutlined />,
    dataTypeSupported: ({ dataType, dataFormat }) =>
        dataType === DataTypes.string && dataFormat === StringFormats.phoneNumber,
    Factory: ({ model }) => {
        const {
            readOnly,
            hidden,
            country,
            defaultCountry,
            allowClear,
            enableArrow = true,
            enableSearch = true,
            disableParentheses,
            onlyCountries,
            excludeCountries,
            preferredCountries,
            searchNotFound,
        } = model;
        const allData = useAvailableConstantsData();
        const [isValid, setIsValid] = useState(true);

        const styling = JSON.parse(model.stylingBox || '{}');
        const stylingBoxAsCSS = pickStyleFromModel(styling);

        const additionalStyles: CSSProperties = removeUndefinedProps({
            ...stylingBoxAsCSS,
        });
        const jsStyle = getStyle(model.style, allData.data);
        const finalStyle = removeUndefinedProps({ ...jsStyle, ...additionalStyles });

        if (hidden) return null;

        return (
            <ConfigurableFormItem
                model={model}
                initialValue={
                    model.initialValue
                        ? evaluateString(model.initialValue, {
                            formData: allData.data,
                            formMode: allData.form.formMode,
                            globalState: allData.globalState,
                        })
                        : undefined
                }
            >
                {(value, onChange) => {
                    const customEvents = getEventHandlers(model, allData);

                    const onChangeInternal = (phoneValue: any) => {
                        if (!phoneValue || !phoneValue?.areaCode) {
                            setIsValid(true);
                            const syntheticEvent = {
                                target: { value: '' },
                                currentTarget: { value: '' },
                                phoneValue,
                            };
                            customEvents?.onChange?.(syntheticEvent as any);
                            onChange?.('');
                            return;
                        }

                        // Validate phone number format using the library's built-in validation
                        const isValidFormat = phoneValue.valid !== undefined ? phoneValue.valid : true;
                        setIsValid(isValidFormat);

                        if (!isValidFormat) {
                            // Don't save invalid phone numbers, but still fire the event
                            const syntheticEvent = {
                                target: { value: '' },
                                currentTarget: { value: '' },
                                phoneValue,
                            };
                            customEvents?.onChange?.(syntheticEvent as any);
                            return;
                        }

                        const fullNumber = `+${phoneValue.countryCode || ''}${phoneValue.areaCode || ''}${phoneValue.phoneNumber || ''}`;

                        const outputValue: string | IPhoneNumberValue = model.valueFormat === 'object' ? {
                            number: fullNumber,
                            dialCode: phoneValue?.countryCode ? `+${phoneValue.countryCode}` : '',
                            countryCode: phoneValue?.isoCode || '',
                        } : fullNumber;

                        const syntheticEvent = {
                            target: { value: outputValue },
                            currentTarget: { value: outputValue },
                            phoneValue,
                        };
                        customEvents?.onChange?.(syntheticEvent as any);
                        onChange?.(outputValue);
                    };

                    // Parse incoming value with type safety
                    const phoneInputValue: string | undefined = (() => {
                        if (!value) return undefined;
                        if (typeof value === 'string') return value;
                        if (typeof value === 'object' && 'number' in value && value.number) {
                            return value.number;
                        }
                        return undefined;
                    })();

                    const displayValue = typeof value === 'string' ? value : (value as IPhoneNumberValue)?.number;

                    return readOnly ? (
                        <ReadOnlyDisplayFormItem
                            value={displayValue}
                            disabled={readOnly}
                        />
                    ) : (
                        <PhoneInput
                            {...customEvents}
                            placeholder={model.placeholder}
                            size={model.size}
                            disabled={readOnly}
                            allowClear={allowClear}
                            value={phoneInputValue}
                            onChange={onChangeInternal}
                            enableSearch={enableSearch}
                            enableArrow={enableArrow}
                            disableParentheses={disableParentheses}
                            country={country || defaultCountry || 'za'}
                            status={!isValid ? 'error' : undefined}
                            style={finalStyle}
                            {...(searchNotFound && { searchNotFound })}
                            {...(onlyCountries && onlyCountries.length > 0 && { onlyCountries })}
                            {...(excludeCountries && excludeCountries.length > 0 && { excludeCountries })}
                            {...(preferredCountries && preferredCountries.length > 0 && { preferredCountries })}
                        />
                    );
                }}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: settingsForm,
    validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
    initModel: (model) => ({ ...model, valueFormat: 'fullNumber', defaultCountry: 'za', enableArrow: true, enableSearch: true }),
    migrator: (m) => m
        .add<IPhoneNumberInputComponentProps>(0, (prev) => ({ ...prev, valueFormat: 'fullNumber', defaultCountry: 'za', enableArrow: true, enableSearch: true }))
        .add<IPhoneNumberInputComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
        .add<IPhoneNumberInputComponentProps>(2, (prev) => migrateVisibility(prev))
        .add<IPhoneNumberInputComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
        .add<IPhoneNumberInputComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
        .add<IPhoneNumberInputComponentProps>(5, (prev) => {
            const styles: IInputStyles = {
                size: prev.size,
                stylingBox: prev.stylingBox,
                style: prev.style,
            };

            return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
        }),
    linkToModelMetadata: (model): IPhoneNumberInputComponentProps => model,
};

export default PhoneNumberInputComponent;
