import { PhoneOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { getEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { useAvailableConstantsData, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IPhoneNumberInputComponentProps, IPhoneNumberValue } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import PhoneInput from 'antd-phone-input';
import settingsFormJson from './settingsForm.json';

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
      disableParentheses,
      onlyCountries,
      excludeCountries,
      preferredCountries,
      searchNotFound,
    } = model;
    const allData = useAvailableConstantsData();
    const [isValid, setIsValid] = useState(true);

    if (hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const eventHandlers = getEventHandlers(model, allData);

          const onChangeInternal = (phoneValue: any) => {
            if (!phoneValue || !phoneValue?.areaCode) {
              setIsValid(true);
              eventHandlers?.onChange?.({ target: { value: '' } } as any);
              onChange?.('');
              return;
            }

            // Validate phone number format using the library's built-in validation
            const isValidFormat = phoneValue.valid ? phoneValue.valid() : true;
            setIsValid(isValidFormat);

            if (!isValidFormat) {
              // Don't save invalid phone numbers, but still fire the event
              eventHandlers?.onChange?.({ target: { value: '' } } as any);
              return;
            }

            const fullNumber = `+${phoneValue.countryCode}${phoneValue.areaCode}${phoneValue.phoneNumber}`;

            const outputValue: string | IPhoneNumberValue = model.valueFormat === 'object' ? {
              number: fullNumber,
              dialCode: phoneValue?.countryCode ? `+${phoneValue.countryCode}` : '',
              countryCode: phoneValue?.isoCode || '',
            } : fullNumber;

            eventHandlers?.onChange?.({ target: { value: outputValue } } as any);
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

          const onFocusInternal = (e: React.FocusEvent<HTMLInputElement>) => {
            eventHandlers?.onFocus?.(e);
          };

          const onBlurInternal = (e: React.FocusEvent<HTMLInputElement>) => {
            eventHandlers?.onBlur?.(e);
          };

          return readOnly ? (
            <ReadOnlyDisplayFormItem value={displayValue} />
          ) : (
            <PhoneInput
              placeholder={model.placeholder}
              size={model.size}
              disabled={readOnly}
              allowClear={allowClear}
              value={phoneInputValue}
              onChange={onChangeInternal}
              onFocus={onFocusInternal}
              onBlur={onBlurInternal}
              enableSearch={true}
              enableArrow={enableArrow}
              disableParentheses={disableParentheses}
              country={country || defaultCountry || 'za'}
              status={!isValid ? 'error' : undefined}
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
  settingsFormMarkup: settingsFormJson as any,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsFormJson as any, model),
  initModel: (model) => ({ ...model, valueFormat: 'fullNumber', defaultCountry: 'za', enableArrow: true, enableSearch: true }),
  migrator: (m) => m
    .add<IPhoneNumberInputComponentProps>(0, (prev) => ({ ...prev, valueFormat: 'fullNumber', defaultCountry: 'za', enableArrow: true, enableSearch: true }))
    .add<IPhoneNumberInputComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPhoneNumberInputComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<IPhoneNumberInputComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
    .add<IPhoneNumberInputComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  linkToModelMetadata: (model): IPhoneNumberInputComponentProps => model,
};

export default PhoneNumberInputComponent;
