import { DesignerToolbarSettings } from "@/index";
import { nanoid } from '@/utils/uuid';
import { FormLayout } from "antd/es/form/Form";

export const getSettings = (data: any) => {

  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const securityTabId = nanoid();

  const ROW_SAVE_EXPOSED_VARIABLES = [
    {
      id: nanoid(),
      name: 'data',
      description: 'Current row data',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'formData',
      description: 'Form values',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'globalState',
      description: 'The global state of the application',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'http',
      description: 'axios instance used to make http requests',
      type: 'object',
    },
    {
      id: nanoid(),
      name: 'moment',
      description: 'The moment.js object',
      type: 'object',
    }
  ].map(item => JSON.stringify(item));

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: nanoid(),
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
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "componentName",
                parentId: commonTabId,
                label: "Component Name",
                validate: {
                  required: true
                },
                jsSetting: false,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: "hidden",
                parentId: commonTabId,
                label: "Hide",
                jsSetting: true,
                value: 'checked',
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "formSelectionMode",
                parentId: dataTabId,
                label: "Form Selection Mode",
                jsSetting: false,
                dropdownOptions: [
                  { label: 'Named form', value: 'name' },
                  { label: 'View type', value: 'view' },
                  { label: 'Expression', value: 'expression' },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "view";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'formType',
                    label: 'Form Type',
                    parentId: dataTabId,
                    type: 'formTypeAutocomplete',
                    jsSetting: true,
                    width: '100%',
                    allowClear: true,
                  }
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "name";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    propertyName: 'formId',
                    label: 'Create Form',
                    type: 'formAutocomplete',
                    labelAlign: 'right',
                    hidden: false,
                    validate: {
                      required: true,
                    },
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.formSelectionMode) !== "expression";',
                  _mode: 'code',
                  _value: false,
                } as any,
                inputs: [
                  {
                    id: nanoid(),
                    type: 'codeEditor',
                    propertyName: "formIdExpression",
                    label: "Form Identifier Expression",
                    hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "expression";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                    description: "Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key.",
                    exposedVariables: [
                      `{ name: "item", description: "List item", type: "object" }`,
                      `{ name: "data", description: "Selected form values", type: "object" }`,
                      `{ name: "contexts", description: "Contexts data", type: "object" }`,
                      `{ name: "globalState", description: "The global model of the application", type: "object" }`,
                      `{ name: "setGlobalState", description: "Setting the global state of the application", type: "function" }`,
                      `{ name: "formMode", description: "Form mode", type: "object" }`,
                      `{ name: "form", description: "Form instance", type: "object" }`,
                      `{ name: "selectedListItem", description: "Selected list item of nearest table (null if not available)", type: "object" }`,
                      `{ name: "moment", description: "moment", type: "object" }`,
                      `{ name: "http", description: "axiosHttp", type: "object" }`,
                      `{ name: "message", description: "message framework", type: "object" }`,
                    ],
                  }
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "selectionMode",
                parentId: dataTabId,
                label: "Selection Mode",
                jsSetting: true,
                defaultValue: 'none',
                dropdownOptions: [
                  { label: 'None', value: 'none' },
                  { label: 'Single', value: 'single' },
                  { label: 'Multiple', value: 'multiple' },
                ],
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'addInlineData',
                label: 'Can Add Inline',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: 'addInlineDataContent',
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'canAddInline',
                      label: 'Can Add Inline',
                      inputType: 'dropdown',
                      parentId: dataTabId,
                      dropdownOptions: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'inherit', label: 'Inherit' },
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataTabId,
                      hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'createFormId',
                          label: 'Modal Form',
                          type: 'formAutocomplete',
                          labelAlign: 'right',
                          hidden: false,
                          validate: {
                            required: true,
                          },
                        }
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'customCreateUrl',
                          label: 'Custom Create URL',
                          type: 'textField',
                          jsSetting: true,
                        }
                      ]
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      parentId: dataTabId,
                      hidden: {
                        _code: 'return getSettingValue(data?.formSelectionMode) !== "view";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'createFormType',
                          label: 'Create Form Type',
                          type: 'formTypeAutocomplete',
                          jsSetting: true,
                          width: '100%',
                          allowClear: true,
                        }
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [{
                        id: nanoid(),
                        type: 'codeEditor',
                        propertyName: 'onNewListItemInitialize',
                        label: 'New List Item Init',
                        jsSetting: false,
                      },
                      ],
                      hideLabel: true,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
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
                      hideLabel: true,
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'editInlineData',
                label: 'Can Edit Inline',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: 'editInlineDataContent',
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'canEditInline',
                      label: 'Can Edit Inline',
                      inputType: 'dropdown',
                      parentId: dataTabId,
                      dropdownOptions: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'inherit', label: 'Inherit' },
                      ],
                    })
                    .addSettingsInputRow({
                      parentId: dataTabId,
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'inlineEditMode',
                          label: 'Inline Edit Mode',
                          type: 'dropdown',
                          dropdownOptions: [
                            { value: 'all-at-once', label: 'All at Once' },
                            { value: 'one-by-one', label: 'One by One' },
                          ],
                        },
                        {
                          id: nanoid(),
                          propertyName: 'inlineSaveMode',
                          label: 'Inline Save Mode',
                          type: 'dropdown',
                          dropdownOptions: [
                            { value: 'auto', label: 'Auto' },
                            { value: 'manual', label: 'Manual' },
                          ],
                        }
                      ]
                    })
                    .addSettingsInputRow({
                      parentId: dataTabId,
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'customUpdateUrl',
                          label: 'Custom Update URL',
                          type: 'textField',
                          parentId: dataTabId,
                          jsSetting: true,
                        }
                      ]
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                parentId: dataTabId,
                propertyName: 'deleteInlineData',
                label: 'Can Delete Inline',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'canDeleteInline',
                      label: 'Can Delete Inline',
                      inputType: 'dropdown',
                      parentId: dataTabId,
                      dropdownOptions: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'inherit', label: 'Inherit' },
                      ],
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      hidden: { _code: 'return getSettingValue(data?.canDeleteInline) === "no";', _mode: 'code', _value: false } as any,
                      inputs: [
                        {
                          id: nanoid(),
                          propertyName: 'customDeleteUrl',
                          label: 'Custom Delete URL',
                          type: 'textField',
                          parentId: dataTabId,
                        }
                      ]
                    }).toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                parentId: dataTabId,
                propertyName: 'createEditContent',
                label: 'Create & Edit Methods',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                collapsedByDefault: true,
                content: {
                  id: 'createEditContentId',
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [
                        {
                          id: nanoid(),
                          type: 'configurableActionConfigurator',
                          propertyName: 'onListItemSaveSuccessAction',
                          label: 'On List Item Save Action',
                          hideLabel: true,
                        }
                      ],
                      hideLabel: true,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        type: 'codeEditor',
                        propertyName: 'onListItemSave',
                        label: 'On List Item Save',
                        jsSetting: false,
                      }
                      ],
                      hideLabel: true,
                    })
                    .toJson()
                  ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addConfigurableActionConfigurator({
                id: nanoid(),
                propertyName: "dblClickActionConfiguration",
                parentId: eventsTabId,
                label: "On Double Click",
                jsSetting: false,
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'onRowSave',
                label: 'On Row Save',
                inputType: 'codeEditor',
                parentId: eventsTabId,
                tooltip: 'Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>.',
                hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no" && getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                description: 'Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations).',
                exposedVariables: ROW_SAVE_EXPOSED_VARIABLES,
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "orientation",
                parentId: appearanceTabId,
                label: "Orientation",
                jsSetting: true,
                defaultValue: 'vertical',
                dropdownOptions: [
                  { label: 'Vertical', value: 'vertical' },
                  { label: 'Horizontal', value: 'horizontal' },
                  { label: 'Wrap', value: 'wrap' },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                  {
                    id: nanoid(),
                    type: 'textField',
                    propertyName: "cardMinWidth",
                    label: "Card Minimum Width",
                    tooltip: "You can use any unit (%, px, em, etc)",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  },
                  {
                    id: nanoid(),
                    type: 'textField',
                    propertyName: "cardMaxWidth",
                    label: "Card Maximum Width",
                    tooltip: "You can use any unit (%, px, em, etc)",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                  {
                    id: nanoid(),
                    type: 'textField',
                    propertyName: "cardHeight",
                    label: "Card Height",
                    tooltip: "You can use any unit (%, px, em, etc)",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  },
                  {
                    id: nanoid(),
                    type: 'textField',
                    propertyName: "cardSpacing",
                    label: "Card Spacing",
                    tooltip: "You can use any unit (%, px, em, etc)",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                  {
                    id: nanoid(),
                    type: 'switch',
                    propertyName: 'showBorder',
                    label: "Show Border",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  }
                ]
              })
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [{
                  id: nanoid(),
                  type: 'dropdown',
                  propertyName: "listItemWidth",
                  parentId: appearanceTabId,
                  label: "List Item Width",
                  hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal";', _mode: 'code', _value: false } as any,
                  jsSetting: false,
                  dropdownOptions: [
                    { label: '100%', value: '1' },
                    { label: '50%', value: '0.5' },
                    { label: '33%', value: '0.33' },
                    { label: '25%', value: '0.25' },
                    { label: '(Custom)', value: 'custom' },
                  ],
                }]
              })
              .addSettingsInputRow({
                id: nanoid(),
                inputs: [
                  {
                    id: nanoid(),
                    type: 'numberField',
                    propertyName: "customListItemWidth",
                    label: "Custom List Item Width (px)",
                    hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal" || getSettingValue(data?.listItemWidth) !== "custom";', _mode: 'code', _value: false } as any,
                    jsSetting: false,
                  }
                ]
              })
              .addCollapsiblePanel({
                id: nanoid(),
                propertyName: 'pnlGroup',
                label: 'Group Styles',
                parentId: appearanceTabId,
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        type: "switch",
                        propertyName: "collapsible",
                        label: "Collapsible",
                        labelAlign: "right",
                        hidden: false,
                      },
                      {
                        id: nanoid(),
                        type: "switch",
                        propertyName: "collapseByDefault",
                        label: "Collapsible By Default",
                        labelAlign: "right",
                        hidden: false,
                      }],
                      hideLabel: true,
                    })
                    .addSettingsInputRow({
                      id: nanoid(),
                      inputs: [{
                        id: nanoid(),
                        type: 'codeEditor',
                        propertyName: "groupStyle",
                        parentId: appearanceTabId,
                        label: "Style",
                        jsSetting: false,
                        exposedVariables: [
                          { name: "data", description: "Selected form values", type: "object" },
                        ],
                      }
                      ],
                      hideLabel: true,
                    })
                    .toJson()
                  ]
                }
              })
              .addCollapsiblePanel({
                id: nanoid(),
                parentId: appearanceTabId,
                propertyName: 'datalistEmptyState',
                label: 'Empty State',
                labelAlign: 'right',
                ghost: true,
                collapsible: 'header',
                content: {
                  id: nanoid(),
                  components: [...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataIcon',
                      label: 'Icon',
                      inputType: 'iconPicker',
                      jsSetting: true,
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataText',
                      label: 'Primary Text',
                      inputType: 'textField',
                      jsSetting: true,
                      defaultValue: 'No Data',
                    })
                    .addSettingsInput({
                      id: nanoid(),
                      propertyName: 'noDataSecondaryText',
                      label: 'Secondary Text',
                      inputType: 'textField',
                      jsSetting: true,
                      defaultValue: 'No data is available for this table',
                    }).toJson()
                  ]
                }
              })
              .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: "Permissions",
                tooltip: "Enter a list of permissions that should be associated with this component",
                jsSetting: true,
              })
              .toJson()
            ]
          },
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