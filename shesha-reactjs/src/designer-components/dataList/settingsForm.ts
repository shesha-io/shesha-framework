import { DesignerToolbarSettings } from "@/index";
import { nanoid } from '@/utils/uuid';
import { FormLayout } from "antd/es/form/Form";

export const getSettings = (data: any) => {
  const formTypes = [
    {label: 'Table', value: 'table'}, 
    {label: 'Create', value: 'create'}, 
    {label: 'Edit', value: 'edit'}, 
    {label: 'Details', value: 'details'}, 
    {label: 'Quickview', value: 'quickview'}, 
    {label: 'ListItem', value: 'listItem'}, 
    {label: 'Picker', value: 'picker'}
  ];
  
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
            id: nanoid(),
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "componentName",
                parentId: 'root',
                label: "Component name",
                validate: {
                  required: true
                },
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addConfigurableActionConfigurator({
                id: nanoid(),
                propertyName: "dblClickActionConfiguration",
                parentId: 'root',
                label: "On Double Click",
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "selectionMode",
                parentId: 'root',
                label: "Selection mode",
                jsSetting: true,
                defaultValue: 'none',
                dropdownOptions: [
                  { label: 'None', value: 'none' },
                  { label: 'Single', value: 'single' },
                  { label: 'Multiple', value: 'multiple' },
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'render',
            title: 'Render',
            id: nanoid(),
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "formSelectionMode",
                parentId: 'root',
                label: "Form selection mode",
                jsSetting: false,
                defaultValue: 'none',
                dropdownOptions: [
                  { label: 'Named form', value: 'name' },
                  { label: 'View type', value: 'view' },
                  { label: 'Expression', value: 'expression' },
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'formId',
                label: 'Modal form',
                inputType: 'formAutocomplete',
                labelAlign: 'right',
                defaultValue: {
                  "name": "person-create",
                  "module": "Shesha"
              },
                parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
                hidden: false,
                validate: {
                  required: true,
                },
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "formType",
                parentId: 'root',
                label: "Form type",
                hidden: { _code: 'return getSettingValue(data?.formSelectionMode) !== "view";', _mode: 'code', _value: false } as any,
                jsSetting: true,
                dataSourceType: 'entitiesList',
                dropdownOptions: [
                  { label: 'Table', value: 'Table' },
                  { label: 'Create', value: 'Create' },
                  { label: 'Edit', value: 'Edit' },
                  { label: 'Details', value: 'Details' },
                  { label: 'Quickview', value: 'Quickview' },
                  { label: 'ListItem', value: 'ListItem' },
                  { label: 'Picker', value: 'Picker' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: "formIdExpression",
                parentId: 'root',
                label: "Form identifier expression",
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
                // availableConstants: useAvailableConstantsMetadata({
                //   standardConstants: [
                //     SheshaConstants.globalState,
                //     SheshaConstants.setGlobalState,
                //     SheshaConstants.formData,
                //     SheshaConstants.http,
                //     SheshaConstants.moment,
                //     SheshaConstants.message,
                //     SheshaConstants.contexts
                //   ],
                //   onBuild: (builder) => {
                //     builder.addObject("item", "List item", undefined);
                //     builder.addObject("selectedListItem", "Selected list item of nearest table (null if not available)", undefined);      
                //   }
                // }),
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "orientation",
                parentId: 'root',
                label: "Orientation",
                jsSetting: true,
                defaultValue: 'vertical',
                dropdownOptions: [
                  { label: 'Vertical', value: 'vertical' },
                  { label: 'Horizontal', value: 'horizontal' },
                  { label: 'Wrap', value: 'wrap' },
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: "listItemWidth",
                parentId: 'root',
                label: "List Item Width",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                defaultValue: '1',
                dropdownOptions: [
                  { label: '100%', value: '1' },
                  { label: '50%', value: '0.5' },
                  { label: '33%', value: '0.33' },
                  { label: '25%', value: '0.25' },
                  { label: '(Custom)', value: 'custom' },
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'numberField',
                propertyName: "customListItemWidth",
                parentId: 'root',
                label: "Custom List Item Width (px)",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "horizontal" || getSettingValue(data?.listItemWidth) !== "custom";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "cardMinWidth",
                parentId: 'root',
                label: "Card Minimum Width",
                tooltip: "You can use any unit (%, px, em, etc)",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "cardMaxWidth",
                parentId: 'root',
                label: "Card Maximum Width",
                tooltip: "You can use any unit (%, px, em, etc)",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "cardHeight",
                parentId: 'root',
                label: "Card Height",
                tooltip: "You can use any unit (%, px, em, etc)",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: "cardSpacing",
                parentId: 'root',
                label: "Card Spacing",
                tooltip: "You can use any unit (%, px, em, etc)",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                jsSetting: false,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: "showBorder",
                parentId: 'root',
                label: "Show Border",
                hidden: { _code: 'return getSettingValue(data?.orientation) !== "wrap";', _mode: 'code', _value: false } as any,
                jsSetting: true,
                value: 'checked',
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: "hidden",
                parentId: 'root',
                label: "Hidden",
                jsSetting: true,
                value: 'checked',
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
              key: 'emptyList',
              title: 'Empty List',
              id: nanoid(),
              components: [...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textField',
                  propertyName: "noDataText",
                  parentId: 'root',
                  label: "Primary Text",
                  jsSetting: true,
                  defaultValue: "No Data",
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textField',
                  propertyName: "noDataSecondaryText",
                  parentId: 'root',
                  label: "Secondary Text",
                  jsSetting: true,
                  defaultValue: "No data is available for this data list",
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'iconPicker',
                  propertyName: "noDataIcon",
                  parentId: 'root',
                  label: "Icon",
                  jsSetting: false,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .toJson()
              ]
            },
            {
              key: 'security',
              title: 'Security',
              id: nanoid(),
              components: [...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: "permissions",
                  parentId: 'root',
                  label: "Permissions",
                  tooltip: "Enter a list of permissions that should be associated with this component",
                  jsSetting: true,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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