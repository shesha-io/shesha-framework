import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const iconPickerFormSettings = new DesignerToolbarSettings()
  .addCollapsiblePanel({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
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
        .addContextPropertyAutocomplete({
          id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
          propertyName: 'propertyName',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Property name',
          validate: {
            required: true,
          },
        })
        .addTextField({
          id: '46d07439-4c18-468c-89e1-60c002ce96c5',
          propertyName: 'label',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Label',
        })
        .addDropdown({
          id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
          propertyName: 'labelAlign',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
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
        .addTextArea({
          id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
          propertyName: 'title',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Title',
        })
        .addCheckbox({
          id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
          propertyName: 'hidden',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'hide',
        })
        .addCheckbox({
          id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
          propertyName: 'hideLabel',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hide Label',
        })
        .addEditMode({
          id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
          propertyName: 'editMode',
          parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
          label: "Edit mode",
        })
        .addCheckbox({
          id: 'cuw7Y3d33A',
          propertyName: 'allowClear',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Allow clear',
        })
        .addCheckbox({
          id: '3nzgZETY-T',
          propertyName: 'showText',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Show text',
        })
        .addCheckbox({
          id: 'qZfWuwLk9Q',
          propertyName: 'disabledAlpha',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Disable Alpha',
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
