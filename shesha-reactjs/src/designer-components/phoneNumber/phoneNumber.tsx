import { PhoneOutlined } from '@ant-design/icons';
import React, { FC, useState, useMemo, useRef, useEffect } from 'react';
import { IToolboxComponent } from '@/interfaces';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings, getStyle, executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { useFormData } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { IPhoneNumberInputComponentProps, IPhoneNumberValue } from './interface';
import PhoneInput from 'antd-phone-input';
import { nanoid } from 'nanoid';
import { Input } from 'antd';
import { parsePhoneNumberFromString, CountryCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import settingsFormJson from './settingsForm.json';

const settingsFormMarkup = settingsFormJson as FormMarkup;

/**
 * Helper function to intelligently split a national phone number into area code and phone number
 * Uses libphonenumber-js example numbers to determine the proper area code length for a country
 * @param nationalNumber The national phone number (without country code)
 * @param countryCode The ISO country code (e.g., 'ZA', 'US', 'GB')
 * @returns An object containing the areaCode and phoneNumber parts
 */
const splitPhoneNumber = (nationalNumber: string, countryCode?: string): { areaCode: string; phoneNumber: string } => {
    if (!nationalNumber) {
        return { areaCode: '', phoneNumber: '' };
    }

    // Try to get an example number for this country to determine area code length
    if (countryCode) {
        try {
            const exampleNumber = getExampleNumber(countryCode.toUpperCase() as CountryCode, examples);
            if (exampleNumber) {
                const exampleFormatted = exampleNumber.formatNational();

                // Try to detect area code pattern from the formatted example
                // Common patterns: (XXX) XXX-XXXX, 0XX XXX XXXX, XXX XXX XXXX
                const areaCodeMatch = exampleFormatted.match(/^[\(\s]*(\d+)[\)\s]/);
                if (areaCodeMatch && areaCodeMatch[1]) {
                    const exampleAreaCodeLength = areaCodeMatch[1].length;
                    // Use the same length for our number if it makes sense
                    if (exampleAreaCodeLength < nationalNumber.length) {
                        return {
                            areaCode: nationalNumber.substring(0, exampleAreaCodeLength),
                            phoneNumber: nationalNumber.substring(exampleAreaCodeLength)
                        };
                    }
                }
            }
        } catch (error) {
            // If we can't get example number, fall through to default logic
            console.warn(`Could not get example number for country ${countryCode}:`, error);
        }
    }

    // Fallback: Use a reasonable default split
    // For most countries, area codes are 2-4 digits
    // We'll use 1/3 of the number length, capped at 4 digits
    const areaCodeLength = Math.min(4, Math.max(2, Math.floor(nationalNumber.length / 3)));
    return {
        areaCode: nationalNumber.substring(0, areaCodeLength),
        phoneNumber: nationalNumber.substring(areaCodeLength)
    };
};

const PhoneNumberControl: FC<IPhoneNumberInputComponentProps & { value?: any; onChange?: (value: any) => void }> = (props) => {
    const {
        value,
        onChange,
        readOnly,
        country,
        defaultCountry,
        allowClear,
        enableArrow = true,
        enableSearch = true,
        distinct,
        disableParentheses,
        disableDropdown,
        onlyCountries,
        excludeCountries,
        preferredCountries,
        searchNotFound,
        searchPlaceholder,
        placeholder,
        size,
        style,
        valueFormat,
        stripCountryCode = false,
        wrapperStyle,
        inputGroupWrapperStyle,
        inputWrapperStyle,
        inputGroupStyle,
        inputStyle,
        ...model
    } = props;

    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState<string | undefined>(undefined);
    const [clearKey, setClearKey] = useState(0);
    const prevValueRef = useRef(value);
    const { data: formData } = useFormData();
    const allData = useAvailableConstantsData();

    // Only trigger remount when value transitions from having content to null/empty
    useEffect(() => {
        const prevHadValue = prevValueRef.current && prevValueRef.current !== '';
        const nowHasValue = value && value !== '';

        // If we previously had a value and now we don't, force a remount to clear
        if (prevHadValue && !nowHasValue) {
            setClearKey(prev => prev + 1);
        }

        prevValueRef.current = value;
    }, [value]);

    // Parse comma-separated strings to arrays for country codes
    const parseCountryCodes = (value?: string[] | string): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value.length > 0 ? value : undefined;
        const parsed = value.split(',').map(code => code.trim()).filter(code => code.length > 0);
        return parsed.length > 0 ? parsed : undefined;
    };

    const parsedOnlyCountries = parseCountryCodes(onlyCountries);
    const parsedExcludeCountries = parseCountryCodes(excludeCountries);
    const parsedPreferredCountries = parseCountryCodes(preferredCountries);

    // Evaluate style with form data to support dynamic styling
    const componentStyle = getStyle(style, formData, allData?.globalState) || {};



    const onChangeInternal = (phoneNumber: any) => {
        // Extract the raw value - phoneNumber can be:
        // 1. A string
        // 2. An object from antd-phone-input: { countryCode, areaCode, phoneNumber, isoCode }
        // 3. An event object
        let rawValue: string;
        let detectedCountryCode: string | undefined;

        if (typeof phoneNumber === 'string') {
            rawValue = phoneNumber;
        } else if (typeof phoneNumber === 'object' && phoneNumber !== null) {
            // Check if it's the antd-phone-input format
            if ('areaCode' in phoneNumber || 'phoneNumber' in phoneNumber) {
                // Construct the full phone number from parts
                const areaCode = phoneNumber.areaCode || '';
                const phoneNum = phoneNumber.phoneNumber || '';
                const countryCode = phoneNumber.countryCode ? `+${phoneNumber.countryCode}` : '';
                detectedCountryCode = phoneNumber.isoCode?.toUpperCase();

                // Combine parts into full number
                rawValue = `${countryCode}${areaCode}${phoneNum}`.trim();
            } else if (phoneNumber.target?.value) {
                // It's an event object
                rawValue = phoneNumber.target.value;
            } else if (phoneNumber.value) {
                rawValue = phoneNumber.value;
            } else if (phoneNumber.number) {
                rawValue = phoneNumber.number;
            } else {
                rawValue = '';
            }
        } else {
            rawValue = String(phoneNumber ?? '');
        }

        const trimmed = rawValue.trim();

        let nextValue: any;
        if (!trimmed) {
            setIsValid(true);
            setValidationMessage(undefined);
            nextValue = '';
        } else {
            // Try to get the country code from phoneNumber object
            const countryCodeValue = detectedCountryCode || phoneNumber?.countryCode || phoneNumber?.short || phoneNumber?.isoCode;
            const normalizedCountryCode = countryCodeValue?.toString().toUpperCase();

            // First attempt: parse with the provided country code
            let parsed = parsePhoneNumberFromString(
                trimmed,
                normalizedCountryCode && /^[A-Z]{2}$/.test(normalizedCountryCode)
                    ? normalizedCountryCode as CountryCode
                    : undefined
            );

            // Second attempt: if no country code provided or parsing failed, try with default country
            if ((!parsed || !parsed.isValid()) && defaultCountry) {
                parsed = parsePhoneNumberFromString(trimmed, defaultCountry.toUpperCase() as CountryCode);
            }

            // Third attempt: if still no success, try to parse without country code (will auto-detect if number includes country code)
            if (!parsed || !parsed.isValid()) {
                parsed = parsePhoneNumberFromString(trimmed);
            }

            // Validate the number
            let isValidNumber = parsed?.isValid() ?? false;
            let validationMsg: string | undefined = undefined;

            // Prefer library possibility check over example-number heuristics
            if (parsed && typeof parsed.isPossible === 'function' && !parsed.isPossible()) {
                isValidNumber = false;
                validationMsg = 'Phone number length is invalid for the selected country.';
            }

            // Set validation message for other invalid cases
            if (!isValidNumber && !validationMsg) {
                validationMsg = 'Please enter a valid phone number.';
            }

            setIsValid(isValidNumber);
            setValidationMessage(validationMsg);

            if (!isValidNumber) {
                // For invalid input with valueFormat: 'object', return null to maintain type consistency
                // Otherwise keep raw string for user to continue typing
                if (valueFormat === 'object') {
                    nextValue = null;
                } else {
                    nextValue = trimmed;
                }
            } else {
                const internationalNumber = parsed!.number;
                const nationalNumber = parsed!.nationalNumber?.toString() || '';
                const dialCode = parsed!.countryCallingCode ? `+${parsed!.countryCallingCode}` : '';
                const countryCode = parsed!.country ?? '';

                // Return based on valueFormat setting
                if (valueFormat === 'object') {
                    nextValue = { number: internationalNumber, dialCode, countryCode };
                } else if (valueFormat === 'national') {
                    // For 'national' format, return the national number digits only (e.g., "123456789")
                    nextValue = nationalNumber;
                } else {
                    // For 'string' format, return the international format (e.g., "+27123456789")
                    // But if stripCountryCode is true, return national number digits instead
                    nextValue = stripCountryCode ? nationalNumber : internationalNumber;
                }
            }
        }

        // Call the standard onChange
        onChange?.(nextValue);

        // Execute custom onChange handler if defined
        const expression = model?.onChangeCustom;
        if (Boolean(expression)) {
            // Create a context with value and phoneValue exposed
            const contextWithValue = {
                ...allData,
                value: nextValue,
                phoneValue: phoneNumber
            };
            try {
                executeScriptSync(expression, contextWithValue);
            } catch (_e) {
                console.error('Error executing onChange script for PhoneNumberControl:', _e);
            }
        }
    };

    const onBlurInternal = (event: React.FocusEvent<HTMLInputElement>) => {
        const expression = model?.onBlurCustom;
        if (Boolean(expression)) {
            const contextWithEvent = {
                ...allData,
                event
            };
            try {
                executeScriptSync(expression, contextWithEvent);
            } catch (_e) {
                console.error('Error executing onBlur script for PhoneNumberControl:', _e);
            }
        }
    };

    const onFocusInternal = (event: React.FocusEvent<HTMLInputElement>) => {
        const expression = model?.onFocusCustom;
        if (Boolean(expression)) {
            const contextWithEvent = {
                ...allData,
                event
            };
            try {
                executeScriptSync(expression, contextWithEvent);
            } catch (_e) {
                console.error('Error executing onFocus script for PhoneNumberControl:', _e);
            }
        }
    };

    // Convert the stored value to the format expected by PhoneInput component
    // The antd-phone-input expects: { countryCode: number, areaCode: string, phoneNumber: string, isoCode: string }
    const phoneInputValue: any = useMemo(() => {
        // Explicitly handle null, undefined, and empty string
        if (value === null || value === undefined || value === '') return undefined;

        // Extract the actual phone number string from value
        let phoneNumberString: string | undefined;

        if (typeof value === 'string') {
            phoneNumberString = value;
        } else if (typeof value === 'object' && 'number' in value && value.number) {
            phoneNumberString = value.number;
        }

        // If no phone number string or it's empty/whitespace only, return undefined
        if (!phoneNumberString || !phoneNumberString.trim()) return undefined;

        // Parse the phone number to get its components
        // First try parsing as-is (in case it has country code)
        let parsed = parsePhoneNumberFromString(phoneNumberString);

        // If parsing failed and we have a default country, try parsing with default country
        if (!parsed && defaultCountry) {
            parsed = parsePhoneNumberFromString(phoneNumberString, defaultCountry.toUpperCase() as CountryCode);
        }

        // If still no success, return the raw string so the user can continue typing
        // Don't clear the field just because we can't parse it yet
        if (!parsed) {
            // Keep the raw input in the field so user can continue typing
            return phoneNumberString;
        }

        // Extract components for antd-phone-input format
        const nationalNumber = parsed.nationalNumber?.toString() || '';
        const countryCallingCode = parsed.countryCallingCode ? Number(parsed.countryCallingCode) : undefined;
        const isoCode = parsed.country?.toLowerCase() || defaultCountry?.toLowerCase();

        // Split national number into area code and phone number using intelligent splitting
        // This uses libphonenumber-js metadata to determine proper area code lengths by country
        const { areaCode, phoneNumber: phoneNum } = splitPhoneNumber(nationalNumber, parsed.country);

        return {
            countryCode: countryCallingCode,
            areaCode: areaCode,
            phoneNumber: phoneNum,
            isoCode: isoCode
        };
    }, [value, defaultCountry]);

    const displayValue = typeof value === 'string' ? value : (value as IPhoneNumberValue)?.number;

    // Generate unique class name for this instance
    const uniqueClass = useMemo(() => `phone-input-${nanoid(8)}`, []);

    // Evaluate individual styles with form data
    const evaluatedWrapperStyle = getStyle(wrapperStyle, formData, allData?.globalState) || {};
    const evaluatedInputGroupWrapperStyle = getStyle(inputGroupWrapperStyle, formData, allData?.globalState) || {};
    const evaluatedInputWrapperStyle = getStyle(inputWrapperStyle, formData, allData?.globalState) || {};
    const evaluatedInputGroupStyle = getStyle(inputGroupStyle, formData, allData?.globalState) || {};
    const evaluatedInputStyle = getStyle(inputStyle, formData, allData?.globalState) || {};

    // Helper to sanitize CSS values to prevent injection attacks
    const sanitizeCssValue = (value: any): string => {
        if (typeof value !== 'string') return String(value);
        // Remove potentially dangerous characters: braces, comments, semicolons outside of expected contexts
        return value
            .replace(/[{}]/g, '') // Remove braces
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
            .trim();
    };

    // Helper to convert style object to CSS string
    const styleToCss = (styleObj: any) => {
        if (!styleObj || Object.keys(styleObj).length === 0) return '';
        const rules: string[] = [];
        Object.entries(styleObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const sanitizedValue = sanitizeCssValue(value);
                rules.push(`${cssKey}: ${sanitizedValue} !important`);
            }
        });
        return rules.join('; ');
    };

    // Convert CSSProperties to CSS string - target specific elements individually
    // Design: componentStyle acts as a base style applied to all child elements,
    // while specific style props (wrapperStyle, inputStyle, etc.) allow targeted overrides
    const cssString = useMemo(() => {
        const rules: string[] = [];

        // Apply general style to all elements if provided
        if (componentStyle && Object.keys(componentStyle).length > 0) {
            const generalStyles = styleToCss(componentStyle);
            if (generalStyles) {
                rules.push(`
                    .${uniqueClass} .ant-phone-input-wrapper { ${generalStyles} }
                    .${uniqueClass} .ant-input-group-wrapper { ${generalStyles} }
                    .${uniqueClass} .ant-input-wrapper { ${generalStyles} }
                    .${uniqueClass} .ant-input-group { ${generalStyles} }
                    .${uniqueClass} .ant-input { ${generalStyles} }
                `);
            }
        }

        // Apply specific styles to individual elements
        if (Object.keys(evaluatedWrapperStyle).length > 0) {
            rules.push(`.${uniqueClass} .ant-phone-input-wrapper { ${styleToCss(evaluatedWrapperStyle)} }`);
        }
        if (Object.keys(evaluatedInputGroupWrapperStyle).length > 0) {
            rules.push(`.${uniqueClass} .ant-input-group-wrapper { ${styleToCss(evaluatedInputGroupWrapperStyle)} }`);
        }
        if (Object.keys(evaluatedInputWrapperStyle).length > 0) {
            rules.push(`.${uniqueClass} .ant-input-wrapper { ${styleToCss(evaluatedInputWrapperStyle)} }`);
        }
        if (Object.keys(evaluatedInputGroupStyle).length > 0) {
            rules.push(`.${uniqueClass} .ant-input-group { ${styleToCss(evaluatedInputGroupStyle)} }`);
        }
        if (Object.keys(evaluatedInputStyle).length > 0) {
            rules.push(`.${uniqueClass} .ant-input { ${styleToCss(evaluatedInputStyle)} }`);
        }

        return rules.join('\n');
    }, [componentStyle, uniqueClass, evaluatedWrapperStyle, evaluatedInputGroupWrapperStyle, evaluatedInputWrapperStyle, evaluatedInputGroupStyle, evaluatedInputStyle]);

    return readOnly ? (
        <Input
            value={displayValue}
            disabled
            readOnly
            style={componentStyle}
        />
    ) : (
        <>
            {cssString && <style>{cssString}</style>}
            <div className={uniqueClass} style={componentStyle}>
                <PhoneInput
                    key={clearKey}
                    placeholder={placeholder}
                    size={size}
                    disabled={readOnly}
                    allowClear={allowClear}
                    value={phoneInputValue}
                    onChange={onChangeInternal}
                    onBlur={onBlurInternal}
                    onFocus={onFocusInternal}
                    enableSearch={enableSearch}
                    enableArrow={enableArrow}
                    distinct={distinct}
                    disableParentheses={disableParentheses}
                    disableDropdown={disableDropdown}
                    country={country || defaultCountry || 'za'}
                    status={!isValid ? 'error' : undefined}
                    searchNotFound={searchNotFound}
                    searchPlaceholder={searchPlaceholder}
                    onlyCountries={parsedOnlyCountries}
                    excludeCountries={parsedExcludeCountries}
                    preferredCountries={parsedPreferredCountries}
                />
                {validationMessage && (
                    <div style={{
                        color: '#ff4d4f',
                        fontSize: '14px',
                        marginTop: '4px',
                        lineHeight: '1.5715'
                    }}>
                        {validationMessage}
                    </div>
                )}
            </div>
        </>
    );
};

const PhoneNumberInputComponent: IToolboxComponent<IPhoneNumberInputComponentProps> = {
    type: 'phoneNumberInput',
    isInput: true,
    isOutput: true,
    canBeJsSetting: true,
    name: 'Phone Number',
    icon: <PhoneOutlined />,
    Factory: ({ model }) => {
        if (model.hidden) return null;

        return (
            <ConfigurableFormItem model={model}>
                {(value, onChange) => (
                    <PhoneNumberControl {...model} value={value} onChange={onChange} />
                )}
            </ConfigurableFormItem>
        );
    },
    settingsFormMarkup: settingsFormMarkup,
    validateSettings: (model) => validateConfigurableComponentSettings(settingsFormMarkup, model),
    initModel: (model) => ({
        ...model,
        valueFormat: model.valueFormat || 'string',
        stripCountryCode: model.stripCountryCode !== undefined ? model.stripCountryCode : false,
        defaultCountry: model.defaultCountry || 'za',
        enableArrow: model.enableArrow !== undefined ? model.enableArrow : true,
        enableSearch: model.enableSearch !== undefined ? model.enableSearch : true,
        labelAlign: model.labelAlign || 'left',
    }),
    migrator: (m) => m
        .add<IPhoneNumberInputComponentProps>(0, (prev: any) => ({
            ...prev,
            valueFormat: prev.valueFormat === 'fullNumber' ? 'string' : (prev.valueFormat || 'string'),
            stripCountryCode: prev.stripCountryCode !== undefined ? prev.stripCountryCode : false,
            defaultCountry: prev.defaultCountry || 'za',
            enableArrow: prev.enableArrow !== undefined ? prev.enableArrow : true,
        })),
};

export default PhoneNumberInputComponent;
