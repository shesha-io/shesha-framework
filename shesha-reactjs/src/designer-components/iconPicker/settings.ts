import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const iconPickerFormSettings = new DesignerToolbarSettings()
  .addCollapsiblePanel({
    id: '11164664-cbc9-4cef-babc-6fbea44cd0ca',
    propertyName: 'pnlDisplay',
    parentId: 'root',
    label: 'Display',
    labelAlign: 'left',
    expandIconPosition: 'start',
    ghost: true,
    collapsible: 'header',
    content: {
      id: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
      components: [
        ...new DesignerToolbarSettings()
          .addContextPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'propertyName',
            parentId: 'root',
            label: 'Property name',
            validate: {
              required: true,
            },
          })
          .addTextField({
            id: '46d07439-4c18-468c-89e1-60c002ce96c5',
            propertyName: 'label',
            parentId: 'root',
            label: 'Label',
          })
          .addDropdown({
            id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
            propertyName: 'labelAlign',
            parentId: 'root',
            label: 'Label align',
            values: [
              {
                label: 'left',
                value: 'left',
                id: 'f01e54aa-a1a4-4bd6-ba73-c395e48af8ce',
              },
              {
                label: 'right',
                value: 'right',
                id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
              },
            ],
            dataSourceType: 'values',
          })
          .addDropdown({
            id: nanoid(),
            propertyName: 'textAlign',
            parentId: 'root',
            label: 'Icon Align',
            allowClear: false,
            defaultValue: 'start',
            values: [
              {
                label: 'Left',
                value: 'start',
                id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
              },
              {
                label: 'Center',
                value: 'center',
                id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
              },
              {
                label: 'Right',
                value: 'end',
                id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
              },
            ],
            dataSourceType: 'values',
          })
          .addTextArea({
            id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
            propertyName: 'description',
            parentId: 'root',
            label: 'Description',
          }).toJson()
      ],
    },
  })
  .addCollapsiblePanel({
    id: '11164664-cbc9-4cef-babc-6fbea55cd0ca',
    propertyName: 'separatorColor',
    parentId: 'root',
    label: 'Color',
    labelAlign: 'left',
    expandIconPosition: 'start',
    ghost: true,
    collapsible: 'header',
    content: {
      id: 'pnl64664-cbc9-4cdf-babc-6fbea44cd0ca',
      components: [
        ...new DesignerToolbarSettings()
          .addCheckbox({
            id: nanoid(),
            propertyName: 'hidden',
            parentId: 'root',
            label: 'hide',
          })
          .addCheckbox({
            id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
            propertyName: 'hideLabel',
            parentId: 'root',
            label: 'Hide Label',
          })
          .addEditMode({
            id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
            propertyName: 'editMode',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: "Edit mode",
          })
          .toJson(),
      ],
    },
  })
  .addCollapsiblePanel({
    id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5091',
    propertyName: 'pnlStyling',
    parentId: 'root',
    label: 'Icon Styling',
    labelAlign: "left",
    expandIconPosition: "start",
    ghost: true,
    collapsible: 'header',
    content: {
      id: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
      components: [...new DesignerToolbarSettings()
        .addColorPicker({
          id: nanoid(),
          propertyName: 'color',
          label: 'Color',
          title: 'Choose Icon color',
          allowClear: true,
          showText: true,
        })
        .addNumberField({
          id: nanoid(),
          propertyName: 'borderWidth',
          label: 'Border Width',
        })
        .addColorPicker({
          id: nanoid(),
          propertyName: 'borderColor',
          label: 'Border Color',
          title: 'Choose Icon Border color',
          allowClear: true,
          showText: true,
        })
        .addNumberField({
          id: nanoid(),
          propertyName: 'borderRadius',
          label: 'Border Radius',
        })
        .addNumberField({
          id: nanoid(),
          propertyName: 'fontSize',
          label: 'Size',
          defaultValue: 24
        })
        .addColorPicker({
          id: nanoid(),
          propertyName: 'backgroundColor',
          label: 'Background Color',
          title: 'Choose Icon background color',
          allowClear: true,
          showText: true,
        }).addStyleBox({
          id: nanoid(),
          propertyName: 'stylingBox',
          componentName: 'Styling Box',
          parentId: 'root',
          validate: {},
          settingsValidationErrors: [],
          jsSetting: false,
        }).toJson()
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

