import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addTextField({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'componentName',
            parentId: 'root',
            label: 'Component name',
            validate: { required: true },
            jsSetting: false
          })
          .addDropdown({
            id: 'f6c3d710-8d98-47fc-9fe2-7c6312e9a03c',
            propertyName: 'alertType',
            parentId: 'root',
            hidden: false,
            label: 'Type',
            dataSourceType: 'values',
            values: [
              { id: '17a865b3-8e28-41de-ab40-1fc49a56b31d', label: 'Success', value: 'success' },
              { id: 'edeb7d32-f942-41cc-a941-07b8882d8faa', label: 'Info', value: 'info' },
              { id: 'df342c95-4dae-49a5-beff-259d0f2ebcb3', label: 'Warning', value: 'warning' },
              { id: '21fc57e5-5e5d-4ae8-83c4-080a15b55176', label: 'Error', value: 'error' },
            ],
            validate: { required: true },
            defaultValue: 'info',
          })
          .addTextArea({
            id: '277b7ffe-d023-4543-a4b4-ff7f76052867',
            propertyName: 'text',
            parentId: 'root',
            hidden: false,
            label: 'Text',
            autoSize: false,
            showCount: false,
            allowClear: false,
            validate: { required: true },
            description: 'Accepts {{mustache}} syntax',
          })
          .addTextArea({
            id: '8340f638-c466-448e-99cd-fb8c544fe02a',
            propertyName: 'description',
            parentId: 'root',
            hidden: false,
            label: 'Description',
            autoSize: false,
            showCount: false,
            description: 'Accepts {{mustache}} syntax',
          })
          .addCheckbox({
            id: '65aef83a-ea37-480a-9d77-ee4f4e229a70',
            propertyName: 'showIcon',
            parentId: 'root',
            label: 'Show Icon',
          })
          .addCheckbox({
            id: '2950EE07-A72F-41E2-B7B1-5E6456D3DAB8',
            propertyName: 'closable',
            label: 'Closable',
            parentId: 'root',
          })
          .addIconPicker({
            id: '152f3d72-68fb-43ab-adf6-8cf7d11fe6e1',
            propertyName: 'icon',
            label: 'Icon',
            parentId: 'root',
          })
          .addCheckbox({
            id: '148e12c0-41a0-4fa2-8c64-8f6dd5213a3e',
            propertyName: 'hidden',
            label: 'hide',
            parentId: 'root',
          })
          .toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: '22224bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlData',
      parentId: 'root',
      label: 'Style',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addCodeEditor({
            id: '987c3de1-b959-4670-96f6-9b1747189a6e',
            propertyName: 'style',
            label: 'Style',
            parentId: 'root',
            mode: 'dialog',
          })
          .toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
      propertyName: 'pnlSecurity',
      parentId: 'root',
      label: 'Security',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
        components: [...new DesignerToolbarSettings()
          .addPermissionAutocomplete({
            id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
            propertyName: 'permissions',
            label: 'Permissions',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            validate: {},
            jsSetting: true,
          }).toJson()
        ]
      }
    })
    .toJson();



