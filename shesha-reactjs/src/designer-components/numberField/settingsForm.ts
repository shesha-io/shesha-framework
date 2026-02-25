import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const numberFormatOptions = [
    { value: 'integer', label: 'Integer' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'currency', label: 'Currency' },
    { value: 'percent', label: 'Percent' },
    { value: 'custom', label: 'Custom' },
  ];
  /* const numberFormatChange = (value, _data, setFormData): void => {
    if (value === 'percent') {
      setFormData({ values: { numDecimalPlaces: 0, prefix: undefined, suffix: '%' }, mergeValues: true });
    } else if (value === 'integer') {
      setFormData({ values: { numDecimalPlaces: 0, prefix: undefined, suffix: undefined }, mergeValues: true });
    } else if (value === 'decimal') {
      setFormData({ values: { numDecimalPlaces: 2, prefix: undefined, suffix: undefined }, mergeValues: true });
    } else if (value === 'currency') {
      setFormData({ values: { numDecimalPlaces: 2, prefix: undefined, suffix: undefined }, mergeValues: true });
    }
  };*/

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
            key: '1', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'label', label: 'Label', hideLabel: true })
                .stdPlaceholerDescriptionInputs()
                .stdVisibleEditableInputs()
                .stdCollapsiblePanel('Format', (fb) => fb
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'numberFormat', label: 'Format', dropdownOptions: numberFormatOptions /* , onChangeSetting: numberFormatChange*/ })
                  .addSettingsInputRow({ inputs: [
                    { type: 'numberField', propertyName: `numDecimalPlaces`, label: 'Num decimal places' },
                    { type: 'textField', propertyName: `thousandsSeparator`, label: 'Thousands separator' },
                  ], visibleJs: 'return data?.numberFormat !== "integer";' })
                  .addSettingsInputRow({ inputs: [
                    { type: 'textField', propertyName: `customFormat`, label: 'Custom format', tooltip: 'numbro.js like format (https://numbrojs.com/old-format.html) or you can use JS mode to implement any transformation',
                      jsSetting: 'lazy', availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard().addString("value", "Component current value").build();' },
                    { type: 'switch', propertyName: 'highPrecision', label: 'String format', tooltip: 'Save value as string to prevent loss of precision' },
                  ], visibleJs: 'return data?.numberFormat !== "integer";' })
                  .addSettingsInputRow({ inputs: [
                    { type: 'textField', propertyName: `thousandsSeparator`, label: 'Thousands separator' },
                    { type: 'textField', propertyName: `customFormat`, label: 'Custom format', tooltip: 'numbro.js like format (https://numbrojs.com/old-format.html) or you can use JS mode to implement any transformation',
                      jsSetting: 'lazy', availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard().addString("value", "Component current value").build();' },
                  ], visibleJs: 'return data?.numberFormat === "integer";' }))
                .stdPrefixSuffixInputs('return ["currency", "custom"].includes(data?.numberFormat);')
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'numberField', propertyName: 'validate.minValue', label: 'Min Value', size: 'small', jsSetting: true, tooltip: 'Minimum allowed value, leave empty for no limit' },
                      { type: 'numberField', propertyName: 'validate.maxValue', label: 'Max Value', size: 'small', jsSetting: false, tooltip: 'Maximum allowed value, leave empty for no limit' },
                    ],
                  }))

                .toJson(),
            ],
          },
          {
            key: '2', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange', 'onFocus', 'onBlur']).toJson()],
          },
          {
            key: '3', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle']).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
