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
            id: '5d4d56fb-d7f8-4835-a529-c4fa93f3596d',
            propertyName: 'componentName',
            label: 'Component name',
            labelAlign: 'right',
            parentId: 'root',
            hidden: false,
            validate: {
              required: true,
            },
            jsSetting: false
          })
          .addTextField({
            id: 'd498779d-012a-4c6a-82a9-77231245ae28',
            propertyName: 'label',
            parentId: 'root',
            label: 'Label',
          })
          .addTextArea({
            id: '9b671866-072e-4688-8b48-ddf5e12d70d4',
            propertyName: 'tooltip',
            label: 'Tooltip',
            labelAlign: 'right',
            parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
            hidden: false,
            autoSize: false,
            showCount: false,
            allowClear: false,
            validate: {},
          })
          .addIconPicker({
            id: '91b404a6-4021-4b0a-b9ef-007167a93075',
            propertyName: 'icon',
            label: 'Icon',
            labelAlign: 'right',
            parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
            hidden: false,
            settingsValidationErrors: [],
          })
          .addDropdown({
            id: 'be15598e-5c23-40bc-8245-6b5385bb7963',
            propertyName: 'buttonType',
            label: 'Button Type',
            labelAlign: 'right',
            parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
            hidden: false,
            validate: {
              required: true,
            },
            dataSourceType: 'values',
            values: [
              {
                id: 'c4a96833-8ed7-4085-8848-169d5607136d',
                label: 'primary',
                value: 'primary',
              },
              {
                id: 'c6f974da-ad28-44e5-8e4d-50280cf24ae7',
                label: 'ghost',
                value: 'ghost',
              },
              {
                id: '71c0dc14-0473-4748-ae75-a4ed3bd6cffd',
                label: 'dashed',
                value: 'dashed',
              },
              {
                id: '789d5733-2d4f-4969-890f-613e5b4a7d59',
                label: 'link',
                value: 'link',
              },
              {
                id: '36abe636-40b2-476c-95b0-78a50478146b',
                label: 'text',
                value: 'text',
              },
              {
                id: 'de08ea36-a831-4373-ab10-ce25fadf80cd',
                label: 'default',
                value: 'default',
              },
            ],
          })
          .addCheckbox({
            id: '4e9b886a-6186-4467-a688-639b30a0e06f',
            propertyName: 'danger',
            label: 'Danger',
            labelAlign: 'right',
            parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
            hidden: false,
            validate: {},
          })
          .addCheckbox({
            id: 'd25a7d85-6afe-4595-899f-62675fb6c491',
            propertyName: 'block',
            label: 'Block',
            labelAlign: 'right',
            parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
            hidden: false,
            validate: {},
          })
          .addCheckbox({
            id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
            propertyName: 'hidden',
            parentId: 'root',
            label: 'Hidden',
          })
          .addEditMode({
            id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
            propertyName: 'editMode',
            parentId: 'root',
            label: "Edit mode",
          })
          .addConfigurableActionConfigurator({
            id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
            propertyName: 'actionConfiguration',
            label: 'Action configuration',
            hidden: false,
            validate: {},
            settingsValidationErrors: [],
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
            id: '06ab0599-914d-4d2d-875c-765a495472f8',
            propertyName: 'style',
            label: 'Style',
            parentId: 'root',
            validate: {},
            settingsValidationErrors: [],
            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
            exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
          })
          .addDropdown({
            id: '8615d12f-6ea0-4b11-a1a1-6088c7160fd9',
            propertyName: 'size',
            parentId: 'root',
            label: 'Size',
            allowClear: true,
            values: [
              {
                label: 'Small',
                value: 'small',
                id: '4f11403c-95fd-4e49-bb60-cb8c25f0f3c3',
              },
              {
                label: 'Middle',
                value: 'middle',
                id: '8f85c476-e632-4fa7-89ad-2be6cfb7f1f1',
              },
              {
                label: 'Large',
                value: 'large',
                id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
              },
            ],
            dataSourceType: 'values',
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
          }).toJson()
        ]
      }
    })
    .toJson();
