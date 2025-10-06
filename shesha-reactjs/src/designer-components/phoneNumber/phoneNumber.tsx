import { PhoneOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IEventHandlers, getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IPhoneNumberInputComponentProps, IPhoneNumberValue } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import PhoneInput from 'antd-phone-input';
import { getEnabledCountries } from './constants';
import { validateDialCode } from './validation';

interface IPhoneNumberInputComponentCalculatedValues {
  eventHandlers?: IEventHandlers;
}

const PhoneNumberInputComponent: IToolboxComponent<IPhoneNumberInputComponentProps, IPhoneNumberInputComponentCalculatedValues> = {
  type: 'phoneNumberInput',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Phone Number',
  icon: <PhoneOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.phoneNumber,
  calculateModel: (model, allData) => ({ eventHandlers: getAllEventHandlers(model, allData) }),
  Factory: ({ model, calculatedModel }) => {
    const { readOnly, enableStyleOnReadonly, allStyles, hidden, allowedDialCodes, defaultCountry, allowClear, enforceAllowedDialCodes } = model;

    const finalStyle = useMemo(() => !enableStyleOnReadonly && readOnly ? {
      ...allStyles.fontStyles,
      ...allStyles.dimensionsStyles,
    } : allStyles.fullStyle, [enableStyleOnReadonly, readOnly, allStyles.fontStyles, allStyles.dimensionsStyles, allStyles.fullStyle]);

    const enabledCountries = useMemo(
      () => getEnabledCountries(allowedDialCodes),
      [allowedDialCodes]
    );

    if (hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const { eventHandlers } = calculatedModel;

          const onChangeInternal = (phoneValue: any) => {
            if (!phoneValue) {
              eventHandlers?.onChange?.({ value: '' }, null);
              onChange?.('');
              return;
            }

            const fullNumber = phoneValue?.areaCode
              ? `+${phoneValue.countryCode}${phoneValue.areaCode}${phoneValue.phoneNumber}`
              : '';

            const outputValue: string | IPhoneNumberValue = model.valueFormat === 'object' ? {
              number: fullNumber,
              dialCode: phoneValue?.countryCode ? `+${phoneValue.countryCode}` : '',
              countryCode: phoneValue?.short || '',
            } : fullNumber;

            // Validate dial code if enforcement is enabled
            if (enforceAllowedDialCodes && allowedDialCodes && allowedDialCodes.length > 0) {
              const validationResult = validateDialCode(outputValue, allowedDialCodes);
              if (validationResult !== true) {
                // Don't update the value if validation fails, but still fire the event
                eventHandlers?.onChange?.({ value: outputValue }, phoneValue);
                return;
              }
            }

            eventHandlers?.onChange?.({ value: outputValue }, phoneValue);
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
            <ReadOnlyDisplayFormItem value={displayValue} style={finalStyle} />
          ) : (
            <PhoneInput
              placeholder={model.placeholder}
              size={model.size}
              disabled={readOnly}
              allowClear={allowClear}
              style={allStyles.fullStyle}
              value={phoneInputValue}
              onChange={onChangeInternal}
              onFocus={onFocusInternal}
              onBlur={onBlurInternal}
              enableSearch
              country={enabledCountries?.[0] || defaultCountry || 'za'}
              {...(enabledCountries && { enabledCountries })}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => ({ ...model, valueFormat: 'fullNumber', allowedDialCodes: [], defaultCountry: 'za' }),
  migrator: (m) => m
    .add<IPhoneNumberInputComponentProps>(0, (prev) => ({ ...prev, valueFormat: 'fullNumber', allowedDialCodes: [], defaultCountry: 'za' }))
    .add<IPhoneNumberInputComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPhoneNumberInputComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<IPhoneNumberInputComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
    .add<IPhoneNumberInputComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  linkToModelMetadata: (model): IPhoneNumberInputComponentProps => model,
};

export default PhoneNumberInputComponent;
