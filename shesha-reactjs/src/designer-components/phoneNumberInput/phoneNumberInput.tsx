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

interface IPhoneNumberInputComponentCalulatedValues {
  eventHandlers?: IEventHandlers;
}

const PhoneNumberInputComponent: IToolboxComponent<IPhoneNumberInputComponentProps, IPhoneNumberInputComponentCalulatedValues> = {
  type: 'phoneNumberInput',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Phone Number Input',
  icon: <PhoneOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.phoneNumber,
  calculateModel: (model, allData) => ({ eventHandlers: getAllEventHandlers(model, allData) }),
  Factory: ({ model, calculatedModel }) => {
    const finalStyle = useMemo(() => !model.enableStyleOnReadonly && model.readOnly ? {
      ...model.allStyles.fontStyles,
      ...model.allStyles.dimensionsStyles,
    } : model.allStyles.fullStyle, [model.enableStyleOnReadonly, model.readOnly, model.allStyles]);

    if (model.hidden) return null;

    // Determine which countries to enable based on allowedDialCodes
    const enabledCountries = useMemo(() => {
      if (!model.allowedDialCodes || model.allowedDialCodes.length === 0) {
        return undefined; // All countries enabled by default
      }
      // antd-phone-input uses ISO country codes (e.g., 'us', 'gb', 'za')
      // We need to map dial codes to country codes
      // This is a mapping of common dial codes to ISO country codes
      const dialCodeToCountryMap: Record<string, string[]> = {
        '1': ['us', 'ca'], // USA, Canada
        '27': ['za'], // South Africa
        '44': ['gb'], // United Kingdom
        '61': ['au'], // Australia
        '91': ['in'], // India
        '86': ['cn'], // China
        '81': ['jp'], // Japan
        '82': ['kr'], // South Korea
        '33': ['fr'], // France
        '49': ['de'], // Germany
        '39': ['it'], // Italy
        '34': ['es'], // Spain
        '351': ['pt'], // Portugal
        '31': ['nl'], // Netherlands
        '32': ['be'], // Belgium
        '41': ['ch'], // Switzerland
        '43': ['at'], // Austria
        '45': ['dk'], // Denmark
        '46': ['se'], // Sweden
        '47': ['no'], // Norway
        '48': ['pl'], // Poland
        '55': ['br'], // Brazil
        '52': ['mx'], // Mexico
        '54': ['ar'], // Argentina
        '56': ['cl'], // Chile
        '57': ['co'], // Colombia
        '58': ['ve'], // Venezuela
        '20': ['eg'], // Egypt
        '27': ['za'], // South Africa
        '234': ['ng'], // Nigeria
        '254': ['ke'], // Kenya
        '971': ['ae'], // UAE
        '966': ['sa'], // Saudi Arabia
        '962': ['jo'], // Jordan
        '965': ['kw'], // Kuwait
        '968': ['om'], // Oman
        '974': ['qa'], // Qatar
        '973': ['bh'], // Bahrain
        '60': ['my'], // Malaysia
        '65': ['sg'], // Singapore
        '66': ['th'], // Thailand
        '84': ['vn'], // Vietnam
        '62': ['id'], // Indonesia
        '63': ['ph'], // Philippines
        '64': ['nz'], // New Zealand
      };

      const enabledCountryCodes: string[] = [];
      model.allowedDialCodes.forEach(dialCode => {
        const cleanDialCode = dialCode.replace('+', '').trim();
        const countries = dialCodeToCountryMap[cleanDialCode];
        if (countries) {
          enabledCountryCodes.push(...countries);
        }
      });

      return enabledCountryCodes.length > 0 ? enabledCountryCodes : undefined;
    }, [model.allowedDialCodes]);

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          const customEvents = calculatedModel.eventHandlers;

          const onChangeInternal = (phoneValue: any) => {
            let outputValue: string | IPhoneNumberValue;

            if (model.valueFormat === 'object') {
              // Return object with number, dialCode, and countryCode
              outputValue = {
                number: phoneValue?.areaCode ? `+${phoneValue.countryCode}${phoneValue.areaCode}${phoneValue.phoneNumber}` : '',
                dialCode: phoneValue?.countryCode ? `+${phoneValue.countryCode}` : '',
                countryCode: phoneValue?.short || '',
              };
            } else {
              // Default: return full number as string (e.g., "+27123456789")
              outputValue = phoneValue?.areaCode
                ? `+${phoneValue.countryCode}${phoneValue.areaCode}${phoneValue.phoneNumber}`
                : '';
            }

            customEvents.onChange({ value: outputValue }, phoneValue);
            if (typeof onChange === 'function') {
              onChange(outputValue);
            }
          };

          // Parse incoming value
          let phoneInputValue = undefined;
          if (value) {
            if (typeof value === 'string') {
              // Parse string like "+27123456789"
              phoneInputValue = { phone: value };
            } else if (typeof value === 'object' && value.number) {
              // Parse object format
              phoneInputValue = { phone: value.number };
            }
          }

          return model.readOnly
            ? <ReadOnlyDisplayFormItem
                value={typeof value === 'string' ? value : value?.number}
                style={finalStyle}
              />
            : <PhoneInput
                placeholder={model.placeholder}
                size={model.size}
                disabled={model.readOnly}
                style={model.allStyles.fullStyle}
                value={phoneInputValue}
                onChange={onChangeInternal}
                enableSearch
                country={enabledCountries && enabledCountries.length > 0 ? enabledCountries[0] : 'us'}
                {...(enabledCountries && { enabledCountries })}
              />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => ({ ...model, valueFormat: 'fullNumber', allowedDialCodes: [] }),
  migrator: (m) => m
    .add<IPhoneNumberInputComponentProps>(0, (prev) => ({ ...prev, valueFormat: 'fullNumber', allowedDialCodes: [] }))
    .add<IPhoneNumberInputComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPhoneNumberInputComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<IPhoneNumberInputComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
    .add<IPhoneNumberInputComponentProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  linkToModelMetadata: (model): IPhoneNumberInputComponentProps => model,
};

export default PhoneNumberInputComponent;
