import { PhoneOutlined } from '@ant-design/icons';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import PhoneInput, { PhoneNumber as IAntdPhoneNumber } from 'antd-phone-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { ConfigurableFormItemContext } from '@/components/formDesigner/components/model';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';

import { useAvailableConstantsData } from '@/providers/form/utils';
import { executeScriptSync } from '@/providers/form/utils/scripts';
import { DataTypes } from '@/interfaces/dataTypes';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '@/designer-components/_common/events';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { IInputStyles } from '@/providers/form/models';
import { IPhoneNumberComponentProps, IPhoneNumberValue, PhoneNumberComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { defaultStyles, getPhoneValidationError, normalizeCountryCode, parseCountryCodes, splitPhoneNumber } from './utils';

type PhoneNumberValue = string | IPhoneNumberValue | null | undefined;

const PhoneNumberControl: FC<IPhoneNumberComponentProps & {
  value?: PhoneNumberValue;
  onChange?: (value: PhoneNumberValue) => void;
  ctx?: ConfigurableFormItemContext<PhoneNumberValue> | undefined;
}> = (props) => {
  const {
    value,
    onChange,
    ctx,
    readOnly,
    country,
    defaultCountry,
    allowClear = false,
    enableArrow = false,
    distinct = false,
    disableParentheses = false,
    disableDropdown = false,
    onlyCountries,
    excludeCountries,
    preferredCountries,
    placeholder,
    size,
    valueFormat,
    stripCountryCode,
    styleCss,
    enableStyleOnReadonly,
    ...model
  } = props;

  const [isValid, setIsValid] = useState(true);
  const [clearKey, setClearKey] = useState(0);
  const prevValueRef = useRef(value);
  const allData = useAvailableConstantsData();
  const { styles: styleClasses } = useStyles(props);

  useEffect(() => {
    const prevHadValue = prevValueRef.current && prevValueRef.current !== '';
    const nowHasValue = value && value !== '';

    if (prevHadValue && !nowHasValue) {
      setClearKey((prev) => prev + 1);
    }

    prevValueRef.current = value;
  }, [value]);

  const activeCountry = useMemo(
    () => (normalizeCountryCode(country) || normalizeCountryCode(defaultCountry) || 'ZA').toLowerCase(),
    [country, defaultCountry],
  );

  const parsedOnlyCountries = useMemo(() => parseCountryCodes(onlyCountries), [onlyCountries]);
  const parsedExcludeCountries = useMemo(() => parseCountryCodes(excludeCountries), [excludeCountries]);
  const parsedPreferredCountries = useMemo(() => parseCountryCodes(preferredCountries), [preferredCountries]);

  const onChangeInternal = (phoneNumber: IAntdPhoneNumber): void => {
    const { areaCode, phoneNumber: phoneNum, countryCode, isoCode } = phoneNumber;
    const dialCodePrefix = countryCode ? `+${countryCode}` : '';
    const rawValue = `${dialCodePrefix}${areaCode || ''}${phoneNum || ''}`.trim();

    const trimmed = rawValue.trim();

    let nextValue: PhoneNumberValue;
    if (!trimmed) {
      setIsValid(true);
      nextValue = '';
    } else {
      const normalizedCountryCode = normalizeCountryCode(isoCode);

      let parsed = parsePhoneNumberFromString(trimmed, normalizedCountryCode);

      if ((!parsed || !parsed.isValid()) && defaultCountry) {
        parsed = parsePhoneNumberFromString(trimmed, normalizeCountryCode(defaultCountry));
      }

      if (!parsed || !parsed.isValid()) {
        parsed = parsePhoneNumberFromString(trimmed);
      }

      let isValidNumber = parsed?.isValid() ?? false;

      if (parsed && typeof parsed.isPossible === 'function' && !parsed.isPossible()) {
        isValidNumber = false;
      }

      setIsValid(isValidNumber);

      if (!isValidNumber) {
        nextValue = valueFormat === 'object' ? null : trimmed;
      } else {
        const internationalNumber = parsed!.number;
        const nationalNumber = parsed!.formatNational().replace(/\D/g, '');
        const dialCode = parsed!.countryCallingCode ? `+${parsed!.countryCallingCode}` : '';
        const parsedCountryCode = parsed!.country ?? '';

        if (valueFormat === 'object') {
          nextValue = { number: internationalNumber, dialCode, countryCode: parsedCountryCode };
        } else if (valueFormat === 'national') {
          nextValue = nationalNumber;
        } else {
          nextValue = stripCountryCode ? nationalNumber : internationalNumber;
        }
      }
    }

    onChange?.(nextValue);

    const expression = model.onChangeCustom;
    if (expression) {
      const contextWithValue = { ...allData, value: nextValue, phoneValue: phoneNumber };
      try {
        executeScriptSync(expression, contextWithValue);
      } catch (e) {
        console.error('Error executing onChange script for PhoneNumberControl:', e);
      }
    }
  };

  const onBlurInternal = (event: React.FocusEvent<HTMLInputElement>): void => {
    const expression = model.onBlurCustom;
    if (expression) {
      try {
        executeScriptSync(expression, { ...allData, event });
      } catch (e) {
        console.error('Error executing onBlur script for PhoneNumberControl:', e);
      }
    }
  };

  const onFocusInternal = (event: React.FocusEvent<HTMLInputElement>): void => {
    const expression = model.onFocusCustom;
    if (expression) {
      try {
        executeScriptSync(expression, { ...allData, event });
      } catch (e) {
        console.error('Error executing onFocus script for PhoneNumberControl:', e);
      }
    }
  };

  const phoneInputValue = useMemo<IAntdPhoneNumber | string | undefined>(() => {
    if (value === null || value === undefined || value === '') return undefined;

    let phoneNumberString: string | undefined;
    if (typeof value === 'string') {
      phoneNumberString = value;
    } else if (typeof value === 'object' && 'number' in value) {
      phoneNumberString = value.number;
    }

    if (!phoneNumberString || !phoneNumberString.trim()) return undefined;

    let parsed = parsePhoneNumberFromString(phoneNumberString);
    if (!parsed && defaultCountry) {
      parsed = parsePhoneNumberFromString(phoneNumberString, normalizeCountryCode(defaultCountry));
    }

    if (!parsed) return phoneNumberString;

    const nationalNumber = parsed.nationalNumber.toString() || '';
    const isoCode = parsed.country?.toLowerCase() || defaultCountry?.toLowerCase();
    const { areaCode, phoneNumber: phoneNum } = splitPhoneNumber(nationalNumber, parsed.country);

    const result: IAntdPhoneNumber = { areaCode, phoneNumber: phoneNum };
    if (parsed.countryCallingCode) result.countryCode = Number(parsed.countryCallingCode);
    if (isoCode) result.isoCode = isoCode;
    return result;
  }, [value, defaultCountry]);

  const displayValue = typeof value === 'string' ? value : value?.number;

  if (readOnly) {
    return (
      <ReadOnlyDisplayFormItem
        value={displayValue}
        style={styleCss}
        enableFullStyle={enableStyleOnReadonly}
        styleValue={model as IInputStyles}
      />
    );
  }

  return (
    <div className={styleClasses.phoneNumber}>
      <PhoneInput
        key={clearKey}
        placeholder={placeholder}
        size={size}
        allowClear={allowClear}
        {...getComponentEvents<PhoneNumberValue>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.any)}
        onChange={onChangeInternal}
        onBlur={onBlurInternal}
        onFocus={onFocusInternal}
        enableArrow={enableArrow}
        distinct={distinct}
        disableParentheses={disableParentheses}
        disableDropdown={disableDropdown}
        country={activeCountry}
        style={styleCss}
        {...(!isValid ? { status: 'error' as const } : {})}
        {...(phoneInputValue !== undefined ? { value: phoneInputValue } : {})}
        {...(parsedOnlyCountries !== undefined ? { onlyCountries: parsedOnlyCountries } : {})}
        {...(parsedExcludeCountries !== undefined ? { excludeCountries: parsedExcludeCountries } : {})}
        {...(parsedPreferredCountries !== undefined ? { preferredCountries: parsedPreferredCountries } : {})}
      />
    </div>
  );
};

const PhoneNumberComponent: PhoneNumberComponentDefinition = {
  allowInherit: true,
  type: 'phoneNumberInput',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Phone Number',
  icon: <PhoneOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem<PhoneNumberValue> model={model} initialValue={model.initialValue}>
        {(value, onChange, _, ctx) => <PhoneNumberControl {...model} value={value} onChange={onChange} ctx={ctx} />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,

  getExtraValidationRules: (model) => [
    {
      validator: (_rule, value: PhoneNumberValue) => {
        const error = getPhoneValidationError(value, model.country ?? model.defaultCountry);
        return error ? Promise.reject(new Error(error)) : Promise.resolve();
      },
    },
  ],
  initModel: (model) => ({
    ...model,
    valueFormat: model.valueFormat || 'string',
    stripCountryCode: model.stripCountryCode ?? false,
    defaultCountry: model.defaultCountry || 'za',
    enableArrow: model.enableArrow ?? true,
    labelAlign: model.labelAlign || 'left',
  }),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) => m
    .add<IPhoneNumberComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPhoneNumberComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IPhoneNumberComponentProps>(2, (prev) => migrateReadOnly(prev, 'inherited'))
    .add<IPhoneNumberComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IPhoneNumberComponentProps>(4, (prev, context) => {
      if (context.isNew === true) return prev;

      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IPhoneNumberComponentProps>(5, (prev, context) => (context.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) }))
    .add<IPhoneNumberComponentProps>(6, (prev) => migrateHiddenToVisible(prev))
    .add<IPhoneNumberComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(prev)),
  previewConfiguration: {
    type: 'phoneNumberInput',
    id: 'phoneNumberInput',
    propertyName: 'phoneNumberAppearance',
    label: 'Phone Number Label',
    version: 'latest',
    defaultCountry: 'za',
  },
};

export default PhoneNumberComponent;
