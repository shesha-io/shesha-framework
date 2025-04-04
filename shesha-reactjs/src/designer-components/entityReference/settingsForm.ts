import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { IEntityReferenceControlProps } from './entityReference';

export const getSettings = (data: IEntityReferenceControlProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const mainSettingsTabId = nanoid();
  const appearanceTabId = nanoid();
  const dataTabId = nanoid();
  const securityId = nanoid();
  const styleRouterId = nanoid();
  const propertyNameId = nanoid();
  const hiddenId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: propertyNameId,
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                  styledLabel: true,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: `placeholder-${commonTabId}`,
                      propertyName: 'placeholder',
                      label: 'Placeholder',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'textArea',
                      id: `tooltip-${commonTabId}`,
                      propertyName: 'description',
                      label: 'Tooltip',
                      jsSetting: true,
                    },
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: hiddenId,
                  propertyName: 'hidden',
                  parentId: commonTabId,
                  label: 'Hide',
                  jsSetting: true,
                  layout: 'horizontal',
                })
                .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityId,
                })
                .toJson(),
            ],
          },
          {
            key: 'mainSettings',
            title: 'Main Settings',
            id: mainSettingsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'displayType',
                  label: 'Display Type',
                  inputType: 'dropdown',
                  allowClear: true,
                  size: 'small',
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'displayProperty', label: 'Display Property' },
                    { value: 'icon', label: 'Icon' },
                    { value: 'textTitle', label: 'Text Title' },
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: mainSettingsTabId,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.displayType) !== "icon";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'iconName',
                      label: 'Icon',
                      parentId: mainSettingsTabId,
                      type: 'iconPicker',
                      jsSetting: true,
                      allowClear: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.displayType) !== "textTitle";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'textTitle',
                      label: 'Text Title',
                      parentId: mainSettingsTabId,
                      type: 'textField',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'customStyle',
                  label: 'Custom Styles',
                  labelAlign: 'right',
                  ghost: true,
                  parentId: styleRouterId,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [...new DesignerToolbarSettings()
                      .addSettingsInput({
                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        id: nanoid(),
                        inputType: 'codeEditor',
                        propertyName: 'style',
                        parentId: styleRouterId,
                        label: 'Style',
                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                      })
                      .toJson()
                    ]
                  }
                })
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: 'code',
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addStyleBox({
                                id: nanoid(),
                                label: 'Margin Padding',
                                hideLabel: true,
                                propertyName: 'stylingBox',
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlLayout',
                        label: 'Layout',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'pnlLayout',
                                readOnly: false,
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    propertyName: 'labelCol',
                                    label: 'Label Col',
                                    size: 'small',
                                    jsSetting: true,
                                    min: 0,
                                    max: 24,
                                    defaultValue: 8,
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    propertyName: 'wrapperCol',
                                    label: 'Wrapper Col',
                                    size: 'small',
                                    jsSetting: true,
                                    min: 0,
                                    max: 24,
                                    defaultValue: 16,
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'autocomplete',
                  allowClear: true,
                  propertyName: 'entityType',
                  label: 'Entity Type',
                  description: 'The entity type you want to use for the chart.',
                  labelAlign: 'right',
                  parentId: 'root',
                  hidden: false,
                  dataSourceType: 'url',
                  validate: { required: true },
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  settingsValidationErrors: [],
                  useRawValues: true,
                  width: '100%',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'autocomplete',
                  allowClear: true,
                  propertyName: 'getEntityUrl',
                  label: 'Get Entity URL',
                  labelAlign: 'right',
                  parentId: mainSettingsTabId,
                  hidden: false,
                  dataSourceType: 'url',
                  validate: { required: true },
                  dataSourceUrl: '/api/services/app/Api/Endpoints',
                  settingsValidationErrors: [],
                  useRawValues: true,
                  width: '100%',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.displayType) !== "displayProperty";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'displayProperty',
                      label: 'Display Property',
                      parentId: mainSettingsTabId,
                      type: 'propertyAutocomplete',
                      allowClear: true,
                      jsSetting: true,
                      width: '100%',
                      modelType: '{{data.entityType}}',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'entityReferenceType',
                  label: 'Entity Reference Type',
                  parentId: mainSettingsTabId,
                  inputType: 'dropdown',
                  allowClear: true,
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'Quickview', label: 'Quickview' },
                    { value: 'NavigateLink', label: 'Navigate Link' },
                    { value: 'Dialog', label: 'Dialog' },
                  ],
                  defaultValue: 'Quickview',
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'formSelectionMode',
                  label: 'Form Selection Mode',
                  parentId: dataTabId,
                  inputType: 'dropdown',
                  allowClear: true,
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'name', label: 'Name' },
                    { value: 'dynamic', label: 'Dynamic' },
                  ],
                  defaultValue: 'name',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'formType',
                      label: 'Form Type',
                      parentId: mainSettingsTabId,
                      type: 'formTypeAutocomplete',
                      jsSetting: true,
                      width: '100%',
                      allowClear: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.formSelectionMode) !== "name";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'formIdentifier',
                      label: 'Form Identifier',
                      parentId: mainSettingsTabId,
                      type: 'formAutocomplete',
                      jsSetting: true,
                      allowClear: true,
                    },
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'pnlDialogSettings',
                  label: 'Dialog Settings',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSectionSeparator({
                        id: nanoid(),
                        parentId: dataTabId,
                        label: 'Dialog Settings',
                        labelAlign: 'left',
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        readOnly: false,
                        hidden: {
                          _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'modalWidth',
                            label: 'Dialog Width (%)',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: '40%', label: 'Small' },
                              { value: '60%', label: 'Medium' },
                              { value: '80%', label: 'Large' },
                              { value: 'custom', label: 'Custom' },
                            ],
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        hidden: {
                          _code: 'return getSettingValue(data?.modalWidth) !== "custom";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'widthUnits',
                            label: 'Width Units',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: '%', label: 'Percentage (%)' },
                              { value: 'px', label: 'Pixels (px)' },
                            ],
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        hidden: {
                          _code: 'return getSettingValue(data?.modalWidth) !== "custom";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'customWidth',
                            label: 'Custom Width',
                            parentId: dataTabId,
                            type: 'textField',
                            jsSetting: true,
                            min: 0,
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: {
                          _code: 'return getSettingValue(data?.readOnly);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'modalTitle',
                            label: 'Modal Title',
                            parentId: dataTabId,
                            type: 'textField',
                            jsSetting: true,
                          },
                        ],
                        hidden: {
                          _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        hidden: {
                          _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'footerButtons',
                            label: 'Footer Buttons',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: 'default', label: 'Default' },
                              { value: 'custom', label: 'Custom' },
                              { value: 'none', label: 'None' },
                            ],
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'customFooterButtons',
                            label: 'Custom Footer Buttons',
                            parentId: dataTabId,
                            type: 'buttonGroupConfigurator',
                            jsSetting: true,
                          },
                        ],
                        hidden: {
                          _code: 'return getSettingValue(data?.footerButtons) !== "custom";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'submitHttpVerb',
                            label: 'Submit HTTP Verb',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: 'POST', label: 'POST' },
                              { value: 'PUT', label: 'PUT' },
                            ],
                            defaultValue: 'POST',
                          },
                        ],
                        hidden: {
                          _code: 'return getSettingValue(data?.footerButtons) === "default";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'additionalProperties',
                        label: 'Additional Properties',
                        parentId: dataTabId,
                        jsSetting: true,
                        inputType: 'labelValueEditor',
                        tooltip:
                          'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                          'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                          'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                        exposedVariables: [
                          { name: 'data', description: 'This form data', type: 'object' },
                          { name: 'form', description: 'Form instance', type: 'object' },
                          {
                            name: 'formMode',
                            description: 'Current form mode',
                            type: "'designer' | 'edit' | 'readonly'",
                          },
                          { name: 'globalState', description: 'Global state', type: 'object' },
                          {
                            name: 'entityReference.id',
                            description: 'Id of entity reference entity',
                            type: 'object',
                          },
                          { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                          { name: 'moment', description: 'moment', type: '' },
                          { name: 'http', description: 'axiosHttp', type: '' },
                        ].map((item) => JSON.stringify(item)),
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'handleSuccess',
                            label: 'Handle Success',
                            parentId: dataTabId,
                            type: 'switch',
                            defaultValue: true,
                            jsSetting: true,
                            width: '100%',
                          },
                        ],
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlOnSuccess',
                        label: 'On Success Handler',
                        labelAlign: 'left',
                        parentId: dataTabId,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return getSettingValue(data?.handleSuccess) !== true;',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addConfigurableActionConfigurator({
                                id: nanoid(),
                                propertyName: 'onSuccess',
                                label: 'On Success',
                                parentId: dataTabId,
                                jsSetting: true,
                              })
                              .toJson(),
                          ]
                        }
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        readOnly: false,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'handleFail',
                            label: 'Handle Fail',
                            parentId: dataTabId,
                            type: 'switch',
                            defaultValue: false,
                            jsSetting: false,
                          },
                        ],
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlOnFail',
                        label: 'On Fail Handler',
                        labelAlign: 'left',
                        parentId: dataTabId,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return getSettingValue(data?.handleFail) !== true;',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addConfigurableActionConfigurator({
                                id: nanoid(),
                                propertyName: 'onFail',
                                label: 'On Fail',
                                parentId: dataTabId,
                                jsSetting: false,
                              })
                              .toJson()
                          ]
                        }
                      })
                      .toJson(),
                  ],
                  hidden: {
                    _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'pnlQuickviewSettings',
                  label: 'Quickview Settings',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.entityReferenceType) !== "Quickview";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSectionSeparator({
                        id: nanoid(),
                        parentId: dataTabId,
                        label: 'Quickview Settings',
                        labelAlign: 'left',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'quickviewWidth',
                        label: 'Quickview Width',
                        parentId: dataTabId,
                        inputType: 'numberField',
                        jsSetting: true,
                        defaultValue: 600,
                        min: 0,
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
