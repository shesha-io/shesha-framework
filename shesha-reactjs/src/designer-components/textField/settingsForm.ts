import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const textTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Password', value: 'password' },
    { label: 'Email', value: 'email' },
    { label: 'URL', value: 'url' },
    { label: 'Phone Number', value: 'phone' },
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
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'textType', label: 'Type', size: 'small', jsSetting: true, dropdownOptions: textTypeOptions })
                .stdPrefixSuffixInputs()
                .addSettingsInput({
                  inputType: 'switch', propertyName: 'spellCheck', label: 'Spell Check', jsSetting: true,
                  hidden: { _code: 'return getSettingValue(data?.textType) !== "text";', _mode: 'code', _value: false },
                })
                .stdCollapsiblePanel('Auto-format', (fb) => fb
                  .addSettingsInput({
                    inputType: 'switch', propertyName: 'enableFormatting', label: 'Enable auto-format', size: 'small', layout: 'horizontal', jsSetting: true,
                    tooltip: 'Displays a separator between groups of characters as the user types, e.g. groups "3,4" with separator "-" displays 1234567 as 123-4567. Display only — the stored value and payload never include the separator. Works on a normal text input (no per-character boxes).',
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'formatGroups', label: 'Group lengths', size: 'small', jsSetting: true, tooltip: 'Comma-separated lengths of each group, e.g. 3,4' },
                      { type: 'textField', propertyName: 'formatSeparator', label: 'Separator', size: 'small', jsSetting: true, tooltip: 'Character(s) displayed between groups, e.g. -. Visual only, not included in the stored value.' },
                    ],
                    visibleJs: 'return getSettingValue(data?.enableFormatting) === true;',
                  }),
                undefined, 'return getSettingValue(data?.textType) === "text";')
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
                    visibleJs: 'return getSettingValue(data?.textType) === "text";',
                  })
                  .addSettingsInput({
                    inputType: 'textField', propertyName: 'regExp', label: 'Regular expression', size: 'small', jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.textType) !== "text";', _mode: 'code', _value: false },
                  })
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
