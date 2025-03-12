import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { IEntityReferenceControlProps } from "./entityReference";

export const getSettings = (data: IEntityReferenceControlProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const mainSettingsTabId = nanoid();
  const eventsTabId = nanoid();
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
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: propertyNameId,
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  "required": true
                },
                jsSetting: true,
              })
              .addLabelConfigurator({
                id: nanoid(),
                propertyName: 'hideLabel',
                label: 'Label',
                parentId: commonTabId,
                hideLabel: true,
              })
              .addSettingsInput({
                id: hiddenId,
                propertyName: 'hidden',
                label: 'Hide',
                jsSetting: true,
                layout: 'horizontal',
                inputType: 'switch',
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
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'editModeSelector',
                    id: nanoid(),
                    propertyName: 'editMode',
                    label: 'Edit Mode',
                    size: 'small',
                    jsSetting: true,
                  },
                ],
              })
              .toJson()
            ]
          },
          {
            key: 'mainSettings',
            title: 'Main Settings',
            id: mainSettingsTabId,
            components: [...new DesignerToolbarSettings()
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlEntityReference',
                label: 'Entity Reference',
                labelAlign: 'right',
                ghost: true,
                parentId: mainSettingsTabId,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'autocomplete',
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
                        width: '100%'
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'displayType',
                        label: 'Display Type',
                        inputType: 'dropdown',
                        size: 'small',
                        jsSetting: true,
                        dropdownOptions: [
                          { value: 'displayProperty', label: 'Display Property' },
                          { value: 'icon', label: 'Icon' },
                          { value: 'textTitle', label: 'Text title' },
                        ],
                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        parentId: mainSettingsTabId,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: mainSettingsTabId,
                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        hidden: { _code: 'return getSettingValue(data?.displayType) !== "icon";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'icon',
                          label: 'Icon',
                          parentId: mainSettingsTabId,
                          type: 'iconPicker',
                          jsSetting: true,
                        }]
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: mainSettingsTabId,
                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        hidden: { _code: 'return getSettingValue(data?.displayType) !== "textTitle";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'textTitle',
                          label: 'Text Title',
                          parentId: mainSettingsTabId,
                          type: 'textField',
                          jsSetting: true,
                        }]
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'formSelectionMode',
                        label: 'Form Selection Mode',
                        parentId: mainSettingsTabId,
                        inputType: 'dropdown',
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
                        hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "name";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'formIdentifier',
                          label: 'Form Identifier',
                          parentId: mainSettingsTabId,
                          type: 'formAutocomplete',
                          jsSetting: true,
                        }]
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlQuickviewSettings',
                        label: 'Quickview Settings',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: mainSettingsTabId,
                        collapsible: 'header',
                        hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "quickview";', _mode: 'code', _value: false } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'quickviewWidth',
                                label: 'Quickview width',
                                parentId: mainSettingsTabId,
                                inputType: 'numberField',
                                jsSetting: true,
                                defaultValue: 600,
                                min: 0,
                              })
                              .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlDialogSettings',
                        label: 'Dialog Settings',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: mainSettingsTabId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'modalTitle',
                                label: 'Title',
                                parentId: mainSettingsTabId,
                                inputType: 'textField',
                                jsSetting: true,
                                hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'footerButtons',
                                label: 'Footer Buttons',
                                parentId: mainSettingsTabId,
                                inputType: 'dropdown',
                                jsSetting: true,
                                dropdownOptions: [
                                  { value: 'default', label: 'Default' },
                                  { value: 'custom', label: 'Custom' },
                                  { value: 'none', label: 'None' },
                                ],
                                hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'customFooterButtons',
                                label: 'Custom Footer Buttons',
                                parentId: mainSettingsTabId,
                                inputType: 'buttonGroupConfigurator',
                                hidden: { _code: 'return getSettingValue(data?.footerButtons) !== "custom";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'submitHttpVerb',
                                label: 'Submit HTTP Verb',
                                parentId: mainSettingsTabId,
                                inputType: 'dropdown',
                                jsSetting: true,
                                dropdownOptions: [
                                  { value: 'POST', label: 'POST' },
                                  { value: 'PUT', label: 'PUT' },
                                ],
                                defaultValue: 'POST',
                                hidden: { _code: 'return getSettingValue(data?.footerButtons) === "default";', _mode: 'code', _value: false } as any,
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'additionalProperties',
                                label: 'Additional Properties',
                                parentId: mainSettingsTabId,
                                jsSetting: true,
                                inputType: 'labelValueEditor',
                                tooltip: 'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                                  'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                                  'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                                exposedVariables: ([
                                  { name: 'data', description: 'This form data', type: 'object' },
                                  { name: 'form', description: 'Form instance', type: 'object' },
                                  { name: 'formMode', description: 'Current form mode', type: "'designer' | 'edit' | 'readonly'" },
                                  { name: 'globalState', description: 'Global state', type: 'object' },
                                  { name: 'entityReference.id', description: 'Id of entity reference entity', type: 'object' },
                                  { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                                  { name: 'moment', description: 'moment', type: '' },
                                  { name: 'http', description: 'axiosHttp', type: '' },
                                ]).map((item) => JSON.stringify(item)),
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: mainSettingsTabId,
                                readOnly: false,
                                hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                                inputs: [{
                                  id: nanoid(),
                                  propertyName: 'handleSuccess',
                                  label: 'Handle Success',
                                  parentId: mainSettingsTabId,
                                  type: 'switch',
                                  defaultValue: true,
                                  jsSetting: true,
                                  width: '100%',
                                }]
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: mainSettingsTabId,
                                readOnly: false,
                                hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                                inputs: [{
                                  id: nanoid(),
                                  propertyName: 'handleFail',
                                  label: 'Handle Fail',
                                  parentId: mainSettingsTabId,
                                  type: 'switch',
                                  defaultValue: true,
                                  jsSetting: true,
                                }]
                              })
                              .toJson()
                          ]
                        },
                        hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                      })
                      .toJson()
                  ]
                }
              })
              .toJson()
            ]
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
                  width: '100%'
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: { _code: 'return getSettingValue(data?.displayType) !== "displayProperty";', _mode: 'code', _value: false } as any,
                  inputs: [{
                    id: nanoid(),
                    propertyName: 'displayProperty',
                    label: 'Display Property',
                    parentId: mainSettingsTabId,
                    type: 'propertyAutocomplete',
                    jsSetting: true,
                    width: '100%',
                  }]
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'entityReferenceType',
                  label: 'Entity Reference Type',
                  parentId: mainSettingsTabId,
                  inputType: 'dropdown',
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'quickview', label: 'Quickview' },
                    { value: 'navigateLink', label: 'Navigate Link' },
                    { value: 'dialog', label: 'Dialog' },
                  ],
                  defaultValue: 'Quickview',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: mainSettingsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";', _mode: 'code', _value: false } as any,
                  inputs: [{
                    id: nanoid(),
                    propertyName: 'formType',
                    label: 'Form Type',
                    parentId: mainSettingsTabId,
                    type: 'formTypeAutocomplete',
                    jsSetting: true,
                    width: '100%',
                  }]
                })
                .toJson()
            ]
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlOnSuccess',
                  label: 'On Success',
                  labelAlign: 'right',
                  ghost: true,
                  parentId: mainSettingsTabId,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'onSuccess',
                          label: 'On Success',
                          parentId: mainSettingsTabId,
                          inputType: 'configurableActionConfigurator',
                          jsSetting: true,
                        })
                        .toJson()
                    ]
                  },
                  hidden: { _code: 'return getSettingValue(data?.handleSuccess) !== true;', _mode: 'code', _value: false } as any,
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlOnFail',
                  label: 'On Fail',
                  labelAlign: 'right',
                  ghost: true,
                  parentId: mainSettingsTabId,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'onFail',
                          label: 'On Fail',
                          parentId: mainSettingsTabId,
                          inputType: 'configurableActionConfigurator',
                          jsSetting: true,
                        })
                        .toJson()
                    ]
                  },
                  hidden: { _code: 'return getSettingValue(data?.handleFail) !== true;', _mode: 'code', _value: false } as any,
                })
                .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: "code",
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: ""
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        inputType: 'switch',
                        id: hiddenId,
                        propertyName: 'hidden',
                        label: 'Hide',
                        jsSetting: true,
                        layout: 'horizontal',
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'style',
                        label: 'Custom Style',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                              readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              id: nanoid(),
                              inputType: 'codeEditor',
                              propertyName: 'style',
                              label: 'Style',
                              description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'stylingBox',
                        label: 'Margin & Padding',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [...new DesignerToolbarSettings()
                            .addStyleBox({
                              id: nanoid(),
                              label: 'Margin Padding',
                              hideLabel: true,
                              propertyName: 'stylingBox',
                            })
                            .toJson()
                          ]
                        }
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
                          components: [...new DesignerToolbarSettings()
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
                                }
                              ]
                            })
                            .toJson()
                          ]
                        }
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        readOnly: false,
                        hidden: { _code: 'return getSettingValue(data?.entityReferenceType) !== "dialog";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'modalWidth',
                          label: 'Dialog Width (%)',
                          parentId: mainSettingsTabId,
                          type: 'dropdown',
                          jsSetting: true,
                          dropdownOptions: [
                            { value: '40%', label: 'Small' },
                            { value: '60%', label: 'Medium' },
                            { value: '80%', label: 'Large' },
                            { value: 'custom', label: 'Custom' },
                          ],
                          width: '100%',
                        }]
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        readOnly: false,
                        hidden: { _code: 'return getSettingValue(data?.modalWidth) !== "custom";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'widthUnits',
                          label: 'Width Units',
                          parentId: mainSettingsTabId,
                          type: 'dropdown',
                          jsSetting: true,
                          dropdownOptions: [
                            { value: '%', label: 'Percentage (%)' },
                            { value: 'px', label: 'Pixels (px)' },
                          ],
                          width: '100%',
                        }]
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        readOnly: false,
                        hidden: { _code: 'return getSettingValue(data?.modalWidth) !== "custom";', _mode: 'code', _value: false } as any,
                        inputs: [{
                          id: nanoid(),
                          propertyName: 'customWidth',
                          label: 'Custom Width',
                          parentId: mainSettingsTabId,
                          type: 'textField',
                          jsSetting: true,
                          min: 0,
                          width: '100%',
                        }]
                      })
                      .toJson(),
                  ]
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityId
              })
              .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};
