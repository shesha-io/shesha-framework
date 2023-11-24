import { nanoid } from 'nanoid/non-secure';
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
      id:'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
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
        .addNumberField({
          id: nanoid(),
          propertyName: 'fontSize',
          label: 'Size',
          min: 10,
        })
        .addCheckbox({
          id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
          propertyName: 'hidden',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hidden',
        })
        .addCheckbox({
          id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
          propertyName: 'hideLabel',
          parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          label: 'Hide Label',
        }).toJson()
      ]
    }
  })
  .toJson();
