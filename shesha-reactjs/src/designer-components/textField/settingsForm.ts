import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const textTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Password', value: 'password' },
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
            key: '1', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'textType', label: 'Type', size: 'small', jsSetting: true, dropdownOptions: textTypeOptions })
                .stdPrefixSuffixInputs()
                .addSettingsInput({
                  inputType: 'switch', propertyName: 'spellCheck', label: 'Spell Check', jsSetting: true,
                  hidden: { _code: 'return getSettingValue(data?.textType) === "password";', _mode: 'code', _value: false },
                })
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInput({
                    inputType: 'switch', propertyName: 'useStandardPasswordValidation', label: 'Use standard password validation',
                    tooltip: 'When enabled, the password validation follows the rules defined in the corresponding authentication configuration. When disabled, no global complexity validation is applied.',
                    size: 'small', layout: 'horizontal', jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.textType) !== "password";', _mode: 'code', _value: false },
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'numberField', propertyName: 'validate.minLength', label: 'Min Length', size: 'small', jsSetting: true },
                      { type: 'numberField', propertyName: 'validate.maxLength', label: 'Max Length', size: 'small', jsSetting: true },
                    ],
                    visibleJs: 'return getSettingValue(data?.textType) !== "password";',
                  })
                  .addSettingsInput({ inputType: 'textField', propertyName: 'regExp', label: 'Regular expression', size: 'small', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Validator', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: '2', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange', 'onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onKeyDown'], DataTypes.string).toJson()],
          },
          {
            key: '3', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
