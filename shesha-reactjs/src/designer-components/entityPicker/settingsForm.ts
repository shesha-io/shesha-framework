import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

/**
 * The picker has no free-text input (the Select renders with `open={false}` and no `showSearch`,
 * and selection happens in the modal), so keyboard events can never fire. They are dropped here so
 * the Events tab does not offer handlers that would silently never run.
 */
const ENTITY_PICKER_SETTINGS_EVENTS = ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK
  .filter((event) => event !== 'onKeyDown' && event !== 'onKeyUp');

const entityTypeSelectedJs = 'return !!getSettingValue(data?.entityType);';
const customValueFormatJs = 'return getSettingValue(data?.valueFormat) === "custom";';
const allowNewRecordJs = 'return !!getSettingValue(data?.allowNewRecord);';
const modelTypeFromEntityType = { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' as const };

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const selectionTypeOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Multiple', value: 'multiple' },
  ];
  const valueFormatOptions = [
    { label: 'Simple ID', value: 'simple' },
    { label: 'Entity reference', value: 'entityReference' },
    { label: 'Custom', value: 'custom' },
  ];
  const footerButtonsOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Custom', value: 'custom' },
    { label: 'None', value: 'none' },
  ];
  const modalWidthOptions = [
    { label: 'Small', value: '40%' },
    { label: 'Medium', value: '60%' },
    { label: 'Large', value: '80%' },
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
                .addSettingsInput({
                  inputType: 'textField', propertyName: 'readOnlyPlaceholder', label: 'Read-only Placeholder', size: 'small', jsSetting: true,
                  tooltip: 'Text that gets displayed when empty and in read-only mode.',
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'dropdown', propertyName: 'mode', label: 'Selection Type', size: 'small', jsSetting: true, dropdownOptions: selectionTypeOptions },
                    { type: 'entityTypeAutocomplete', propertyName: 'entityType', label: 'Entity Type', jsSetting: true, validate: { required: true } },
                  ],
                })
                .addSettingsInput({
                  inputType: 'propertyAutocomplete', propertyName: 'displayEntityKey', label: 'Display Property', labelAlign: 'right',
                  modelType: modelTypeFromEntityType, autoFillProps: false, isDynamic: false,
                  tooltip: 'Name of the property that should be displayed in the field. Leave empty to use the default display property defined on the back-end.',
                  visibleJs: entityTypeSelectedJs,
                })
                .addSettingsInput({
                  inputType: 'queryBuilder', propertyName: 'filters', label: 'Entity Filter', labelAlign: 'right', isDynamic: false,
                  modelType: modelTypeFromEntityType,
                  fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                  visibleJs: entityTypeSelectedJs,
                })
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'valueFormat', label: 'Value Format', jsSetting: true, dropdownOptions: valueFormatOptions })
                .addSettingsInputRow({
                  visibleJs: customValueFormatJs,
                  inputs: [
                    { type: 'codeEditor', propertyName: 'incomeCustomJs', label: 'ID Value', labelAlign: 'right', tooltip: 'Return string value of Id' },
                    { type: 'codeEditor', propertyName: 'outcomeCustomJs', label: 'Custom Value', labelAlign: 'right', tooltip: 'Return value that will be stored as field value' },
                  ],
                })
                .addSettingsInput({
                  inputType: 'columnsConfig', propertyName: 'items', label: 'Columns', jsSetting: true,
                  modelType: modelTypeFromEntityType,
                  parentComponentType: 'entityPicker',
                })
                .addSettingsInput({
                  inputType: 'customDropdown', propertyName: 'modalWidth', label: 'Dialog Width', allowClear: true, jsSetting: true,
                  tooltip: 'Width of the dialog used to select an entity.',
                  customTooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                  customDropdownMode: 'single',
                  dropdownOptions: modalWidthOptions,
                })
                .addSettingsInput({ inputType: 'switch', propertyName: 'allowNewRecord', label: 'Allow New Record', size: 'small', layout: 'horizontal', jsSetting: true })
                .stdCollapsiblePanel('Dialog Settings', (fb) => fb
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'modalTitle', label: 'Title', labelAlign: 'right', jsSetting: true, validate: { required: true } },
                      { type: 'formAutocomplete', propertyName: 'modalFormId', label: 'Modal Form', labelAlign: 'right', size: 'small', jsSetting: true, validate: { required: true } },
                    ],
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'dropdown', propertyName: 'footerButtons', label: 'Buttons Type', width: 120, jsSetting: true, dropdownOptions: footerButtonsOptions },
                      {
                        type: 'buttonGroupConfigurator', propertyName: 'buttons', label: 'Configure Modal Buttons', jsSetting: true,
                        visibleJs: 'return getSettingValue(data?.footerButtons) === "custom";',
                      },
                    ],
                  })
                  .addSettingsInput({
                    inputType: 'customDropdown', propertyName: 'addNewModalWidth', label: 'New Record Dialog Width', allowClear: true, jsSetting: true,
                    tooltip: 'Width of the dialog used to create a new record. Independent of the picker `Dialog Width`.',
                    customTooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                    customDropdownMode: 'single',
                    dropdownOptions: modalWidthOptions,
                  }),
                false, allowNewRecordJs)
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validation', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ENTITY_PICKER_SETTINGS_EVENTS], DataTypes.entityReference).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
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
