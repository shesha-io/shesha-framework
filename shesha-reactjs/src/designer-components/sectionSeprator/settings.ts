import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'right',
      expandIconPosition: 'start',
      ghost: true,
      hideWhenEmpty: true,
      header: {
        id: '3342DA1C-DA07-46F6-8026-E8B9A93F094A',
        components: [],
      },
      content: {
        id: '1BCC52E8-FD3B-4309-AD9B-099CDB729441',
        components: new DesignerToolbarSettings()
          .addTextField({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'componentName',
            parentId: 'root',
            label: 'Component name',
            validate: {
              required: true,
            },
          })
          .addCheckbox({
            id: '12345e70-99a0-4825-ae6c-8b933004e119',
            propertyName: 'hidden',
            parentId: 'root',
            label: 'Hidden',
          })
          .addTextField({
            id: '46d07439-4c18-468c-89e1-60c002ce96c5',
            propertyName: 'label',
            parentId: 'root',
            label: 'Label',
          })
          .addCheckbox({
            id: '3b8b9e3f-M5f90-48ae-b4c3-f5cc36f934d9',
            propertyName: 'hideLabel',
            parentId: 'root',
            label: 'Hide Label',
          })
          .addDropdown({
            id: "57a40a33-7e08-4ce4-9f08-a34d24a83338",
            propertyName: "labelAlign",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Label align",
            values: [
              {
                label: "left",
                value: "left",
                id: "f01e54aa-a1a4-4bd6-ba73-c395e48af8ce"
              },
              {
                label: "right",
                value: "right",
                id: "b920ef96-ae27-4a01-bfad-b5b7d07218da"
              },
              {
                label: "center",
                value: "center",
                id: "b920ef96-ae27-4a01-bfad-b5m5wmb70hda"
              }
            ],
            dataSourceType: "values",
            defaultValue: "left"
          })
          .addColorPicker({
            id: "3b8b9e3f-f47e-48ae-b4c3-f5cc36f934d9",
            propertyName: "fontColor",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Font Color",
            allowClear: true,
          })
          .addNumberField({
            id: "3b8b9e3f-f47e-48ae-b4c3-f5cc36f934a9",
            propertyName: "fontSize",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Font Size",
            defaultValue: 14,
          })
          .addCheckbox({
            id: "3b8b9e3f-f47e-48ae-b4c3-f5cc36f934m5",
            propertyName: "inline",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Inline"
          })
          .addCheckbox({
            id: "3b8b9e3f-f10c-48ae-b4c3-f5cc36f934m5",
            propertyName: "noMargin",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "No Margin",
            hidden: { _code: 'return !getSettingValue(data?.inline);', _mode: 'code', _value: true } as any,
          })
          .addTextArea({
            id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
            propertyName: 'description',
            parentId: 'root',
            label: 'Description',
          })
          .addDropdown({
            id: "57a40a33-7e08-4ce4-9f08-a34d00783338",
            propertyName: "orientation",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Orientation",
            values: [
              {
                label: "horizontal",
                value: "horizontal",
                id: "f01e54aa-a1a4-4bd6-ba73-c395e48af8ce"
              },
              {
                label: "vertical",
                value: "vertical",
                id: "b920ef96-ae27-4a01-bfad-b5b7d07218da"
              }
            ],
            dataSourceType: "values"
          })
          .addCheckbox({
            id: "57a40a33-7e08-4ce4-9f08-a34d24a3rs3r",
            propertyName: "dashed",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Dashed",
          })
          .addColorPicker({
            id: "3b8b9e3f-f47e-48ae-b4c3-f5cc36f93aMg",
            propertyName: "lineColor",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Line Color",
            allowClear: true,
          })
          .addNumberField({
            id: "3b8b9e3f-f47e-48ae-b4c3-f90c36f934d9",
            propertyName: "lineThickness",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Line Thickness",
            defaultValue: 2,
          })
          .addTextField({
            id: "3b8bv360-f47e-48ae-b4c3-f5cc36f934a9",
            propertyName: "lineWidth",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Line Width",
            hidden: { _code: 'return getSettingValue(data?.orientation) !== "vertical;', _mode: 'code', _value: true } as any,
            defaultValue: '100%',
          })
          .addTextField({
            id: "3b8bv360-f47e-48ae-b4c3-f5coMp6f934a9",
            propertyName: "lineHeight",
            parentId: "1BCC52E8-FD3B-4309-AD9B-099CDB729441",
            label: "Line Height",
            hidden: { _code: 'return getSettingValue(data?.orientation) === "vertical;', _mode: 'code', _value: true } as any,
          })
          .toJson(),
      },
    })
    .addCollapsiblePanel({
      id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
      propertyName: 'sectionStyle',
      parentId: 'root',
      label: 'Style',
      labelAlign: 'right',
      expandIconPosition: 'start',
      ghost: true,
      hideWhenEmpty: true,
      header: {
        id: '3342DA1C-DA07-46F6-8026-E8B9A93F094A',
        components: [],
      },
      content: {
        id: 'FC8969C8-227F-4F09-90BF-82795C8E4594',
        components: new DesignerToolbarSettings()
          .addCodeEditor({
            id: 'f2504ccf-6c03-4ba4-8f89-776ec2f57b3e',
            propertyName: 'containerStyle',
            label: 'Container Style',
            parentId: 'root',
            validate: {},
            settingsValidationErrors: [],
            description:
              'A script that returns the style of the element as an object. This should conform to CSSProperties',
            exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'getContainerStyle',
            },
            availableConstantsExpression: 'return metadataBuilder.addStandard(["shesha:formData", "shesha:globalState"]).build();'
          })
          .addStyleBox({
            id: 'a0e21b98-0cb9-45ef-8b79-c78c884534f4',
            propertyName: 'stylingBox',
            parentId: 'root',
            validate: {},
            settingsValidationErrors: [],
            jsSetting: false,
          })
          .addCodeEditor({
            id: '77af6050-c35a-470b-9924-b63d6bf355b6',
            propertyName: 'titleStyle',
            label: 'Title Style',
            parentId: 'root',
            validate: {},
            settingsValidationErrors: [],
            description:
              'A script that returns the style of the element as an object. This should conform to CSSProperties',
            exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'getTitleStyle',
            },
            availableConstantsExpression: 'return metadataBuilder.addStandard(["shesha:formData", "shesha:globalState"]).build();'
          })
          .toJson(),
      },
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
