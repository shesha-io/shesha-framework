import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const valueFormatOptions = [
    { label: 'International (+27123456789)', value: 'string' },
    { label: 'National (0123456789)', value: 'national' },
    { label: 'Object', value: 'object' },
  ];

  const isStringFormatJs = 'return getSettingValue(data?.valueFormat) === "string";';

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'valueFormat', label: 'Value Format', size: 'small', jsSetting: true,
                  tooltip: 'Format for the returned phone number value',
                  dropdownOptions: valueFormatOptions,
                })
                .addSettingsInput({
                  inputType: 'switch', propertyName: 'stripCountryCode', label: 'Strip Country Code', size: 'small', layout: 'horizontal', jsSetting: true,
                  tooltip: 'When using International format, return the national format instead (e.g., +27123456789 becomes 0123456789 for ZA). The national format varies by country.',
                  visibleJs: isStringFormatJs,
                })
                .stdCollapsiblePanel('Country Settings', (fb) => fb
                  .addSettingsInput({ inputType: 'textField', propertyName: 'defaultCountry', label: 'Default Country', size: 'small', jsSetting: true, tooltip: 'ISO country code (e.g., za, us, gb)' })
                  .addSettingsInput({ inputType: 'textField', propertyName: 'preferredCountries', label: 'Preferred Countries', size: 'small', jsSetting: true, tooltip: 'Comma-separated country codes to show at top (e.g., za,us,gb)' })
                  .addSettingsInput({ inputType: 'textField', propertyName: 'onlyCountries', label: 'Only Countries', size: 'small', jsSetting: true, tooltip: 'Comma-separated country codes to include (e.g., za,us,gb). If set, only these will be shown' })
                  .addSettingsInput({ inputType: 'textField', propertyName: 'excludeCountries', label: 'Exclude Countries', size: 'small', jsSetting: true, tooltip: 'Comma-separated country codes to exclude from list (e.g., us,ca)' }))
                .stdCollapsiblePanel('Behavior', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'allowClear', label: 'Allow Clear', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInput({ inputType: 'switch', propertyName: 'enableArrow', label: 'Enable Arrow', size: 'small', layout: 'horizontal', jsSetting: true, tooltip: 'Display arrow icons in the phone input' })
                  .addSettingsInput({ inputType: 'switch', propertyName: 'distinct', label: 'Show Distinct Country Codes', size: 'small', layout: 'horizontal', jsSetting: true, tooltip: 'Display only distinct country codes in the dropdown' })
                  .addSettingsInput({ inputType: 'switch', propertyName: 'disableDropdown', label: 'Disable Dropdown', size: 'small', layout: 'horizontal', jsSetting: true, tooltip: 'Prevent users from changing the country via dropdown' })
                  .addSettingsInput({ inputType: 'switch', propertyName: 'disableParentheses', label: 'Disable Parentheses', size: 'small', layout: 'horizontal', jsSetting: true, tooltip: 'Remove parentheses from phone number input mask' }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.string).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
