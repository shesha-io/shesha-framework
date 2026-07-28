import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const dataSourceTypeOptions = [
    { label: 'Values', value: 'values' },
    { label: 'Reference list', value: 'referenceList' },
  ];

  const directionOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
  ];

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
                .stdCollapsiblePanel('Data', (fb) => fb
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data Source Type', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions })
                  .addSettingsInput({
                    inputType: 'labelValueEditor', propertyName: 'items', label: 'Items',
                    labelTitle: 'Label', labelName: 'label', valueTitle: 'Value', valueName: 'value',
                    jsSetting: true, mode: 'dialog',
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "values";',
                  })
                  .addSettingsInput({
                    inputType: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', size: 'small', jsSetting: true,
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "referenceList";',
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validator', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange', 'onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onMouseLeave'], DataTypes.string).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'direction', label: 'Direction', size: 'small', jsSetting: true, dropdownOptions: directionOptions })
                .stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter)
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
