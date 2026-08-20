import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .stdPlaceholderDescriptionInputs()
              .stdVisibleEditableInputs('full')

              .stdCollapsiblePanel('Entity', (fb) => fb
                .addSettingsInput({
                  inputType: 'entityTypeAutocomplete', propertyName: 'entityType', label: 'Entity Type',
                  tooltip: 'The entity type you want to reference.', labelAlign: 'right', jsSetting: true,
                  validate: { required: { _code: 'return !getSettingValue(data?.getEntityUrl);', _mode: 'code', _value: true } },
                  validationDependencies: ['getEntityUrl'],
                })
                .addSettingsInput({
                  inputType: 'endpointsAutocomplete', propertyName: 'getEntityUrl', label: 'Get Entity URL',
                  labelAlign: 'right', size: 'small', mode: 'url', httpVerb: 'get', allowClear: true, jsSetting: true,
                  validate: { required: { _code: 'return !getSettingValue(data?.entityType);', _mode: 'code', _value: true } },
                  validationDependencies: ['entityType'],
                }))

              .stdCollapsiblePanel('Display', (fb) => fb
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'displayType', label: 'Display Type', size: 'small', allowClear: true, jsSetting: true,
                  dropdownOptions: [
                    { value: 'displayProperty', label: 'Display property' },
                    { value: 'icon', label: 'Icon' },
                    { value: 'textTitle', label: 'Text title' },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [{ type: 'iconPicker', propertyName: 'iconName', label: 'Icon', jsSetting: true }],
                  visibleJs: 'return data?.displayType === "icon";',
                })
                .addSettingsInputRow({
                  inputs: [{ type: 'textField', propertyName: 'textTitle', label: 'Text Title', jsSetting: true }],
                  visibleJs: 'return data?.displayType === "textTitle";',
                })
                .addSettingsInputRow({
                  inputs: [{
                    type: 'propertyAutocomplete', propertyName: 'displayProperty', label: 'Display Property', allowClear: true, jsSetting: true,
                    modelType: { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' },
                    autoFillProps: false,
                  }],
                  visibleJs: 'return data?.displayType === "displayProperty";',
                }))

              .stdCollapsiblePanel('Behaviour', (fb) => fb
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'entityReferenceType', label: 'Entity Reference Type', allowClear: true, jsSetting: true,
                  dropdownOptions: [
                    { value: 'Quickview', label: 'Quickview' },
                    { value: 'NavigateLink', label: 'Navigate link' },
                    { value: 'Dialog', label: 'Dialog' },
                  ],
                })
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'formSelectionMode', label: 'Form Selection Mode', allowClear: true, jsSetting: true,
                  dropdownOptions: [
                    { value: 'name', label: 'Name' },
                    { value: 'dynamic', label: 'Dynamic' },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [{ type: 'formTypeAutocomplete', propertyName: 'formType', label: 'Form Type', jsSetting: true }],
                  visibleJs: 'return data?.formSelectionMode === "dynamic";',
                })
                .addSettingsInputRow({
                  inputs: [{ type: 'formAutocomplete', propertyName: 'formIdentifier', label: 'Form Identifier', allowClear: true, jsSetting: true }],
                  visibleJs: 'return data?.formSelectionMode === "name";',
                }))

              .stdCollapsiblePanel('Quickview Settings', (fb) => fb
                .addSettingsInput({
                  inputType: 'textField', propertyName: 'quickviewWidth', label: 'Quickview Width',
                  tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit.',
                  jsSetting: true, icon: 'widthIcon', width: '50%',
                }), false, 'return data?.entityReferenceType === "Quickview";')

              .stdCollapsiblePanel('Dialog Settings', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    { type: 'textField', propertyName: 'modalTitle', label: 'Modal Title', jsSetting: true },
                    {
                      type: 'dropdown', propertyName: 'footerButtons', label: 'Footer Buttons', allowClear: true, jsSetting: true,
                      dropdownOptions: [
                        { value: 'default', label: 'Default' },
                        { value: 'custom', label: 'Custom' },
                        { value: 'none', label: 'None' },
                      ],
                    },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [{ type: 'buttonGroupConfigurator', propertyName: 'buttons', label: 'Configure Modal Buttons', jsSetting: true }],
                  visibleJs: 'return data?.footerButtons === "custom";',
                })
                .addSettingsInputRow({
                  inputs: [{
                    type: 'dropdown', propertyName: 'submitHttpVerb', label: 'Submit HTTP Verb', allowClear: true, jsSetting: true,
                    dropdownOptions: [
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                    ],
                  }],
                  visibleJs: 'return data?.footerButtons === "default";',
                })
                .addSettingsInputRow({
                  inputs: [
                    {
                      type: 'labelValueEditor', propertyName: 'additionalProperties', label: 'Additional Properties', jsSetting: true,
                      labelTitle: 'Key', valueTitle: 'Value', labelName: 'key', valueName: 'value',
                      tooltip:
                        'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                        'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                        'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                    },
                    {
                      type: 'customDropdown', propertyName: 'modalWidth', label: 'Dialog Width', allowClear: true, jsSetting: true,
                      customTooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                      customDropdownMode: 'single',
                      dropdownOptions: [
                        { value: '40%', label: 'Small' },
                        { value: '60%', label: 'Medium' },
                        { value: '80%', label: 'Large' },
                      ],
                    },
                  ],
                })
                .addSettingsInput({ inputType: 'switch', propertyName: 'handleSuccess', label: 'Handle Success', layout: 'horizontal', jsSetting: true })
                .stdCollapsiblePanel('On Success Handler', (f) => f
                  .addConfigurableActionConfigurator({ propertyName: 'onSuccess', label: 'On Success', jsSetting: true }),
                false, 'return data?.handleSuccess === true;')
                .addSettingsInput({ inputType: 'switch', propertyName: 'handleFail', label: 'Handle Fail', layout: 'horizontal', jsSetting: true })
                .stdCollapsiblePanel('On Fail Handler', (f) => f
                  .addConfigurableActionConfigurator({ propertyName: 'onFail', label: 'On Fail', jsSetting: false }),
                false, 'return data?.handleFail === true;'),
              false, 'return data?.entityReferenceType === "Dialog";')

              .stdCollapsiblePanel('Validations', (fb) => fb
                .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))

              .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.entityReference).toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
