import { DesignerToolbarSettings } from 'interfaces/toolbarSettings';
import { nanoid } from 'nanoid';

export const getSettings = () =>
  new DesignerToolbarSettings()
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
        id:'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()    
          .addPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'componentName',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Component name',
            validate: {
              required: true,
            },
          })
          .addTextField({
            id: '46d07439-4c18-468c-89e1-60c002ce96c5',
            propertyName: 'label',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Label',
            jsSetting: true,
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
            jsSetting: true,
          })
          .addTextArea({
            id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
            propertyName: 'description',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Description',
            jsSetting: true,
          })
          .addDropdown({
            id: 'df8a8f35-a50b-42f9-9642-73d390ceddbf',
            propertyName: 'visibility',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Visibility',
            description:
              "This property will eventually replace the 'hidden' property and other properties that toggle visibility on the UI and payload",
            allowClear: true,
            values: [
              {
                label: 'Yes (Display in UI and include in payload)',
                value: 'Yes',
                id: '53cd10ce-26af-474b-af75-8e7b1f19e51d',
              },
              {
                label: 'No (Only include in payload)',
                value: 'No',
                id: 'f07a228c-cb9c-4da7-a8bc-bc2be518a058',
              },
              {
                label: 'Removed (Remove from UI and exlude from payload)',
                value: 'Removed',
                id: '3b6282ee-2eee-47ec-bab9-4cba52b970a0',
              },
            ],
            dataSourceType: 'values',
            jsSetting: true,
            hidden: {_code: 'return  getSettingValue(data?.disabled) ?? false;', _mode: 'code', _value: false} as any,
          })
          .addCheckbox({
            id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
            propertyName: 'hidden',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hidden',
            jsSetting: true,
          })
          .addCheckbox({
            id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
            propertyName: 'hideLabel',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hide Label',
            jsSetting: true,
          })
          .addCheckbox({
            id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
            propertyName: 'disabled',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Disabled',
            jsSetting: true,
          })
          /*.addTextField({
            id: '1ad47439-4c18-468c-89e1-60c002ce96c5',
            name: 'maxHeight',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Max height',
            description: 'Max height of file list (analog)',
            jsSetting: true,
          })*/
          .addCheckbox({
            id: '40024b1c-edd4-4b5d-9c85-1dda6fb8db6c',
            propertyName: 'allowAdd',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow Add',
            validate: {},
            hidden: {_code: 'return  getSettingValue(data?.disabled) ?? false;', _mode: 'code', _value: false} as any,
            jsSetting: true,
          })
          .addCheckbox({
            id: '6b3d298a-0e82-4420-ae3c-38bf5a2246d4',
            propertyName: 'allowDelete',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Allow Remove',
            validate: {},
            hidden: {_code: 'return  getSettingValue(data?.disabled) ?? false;', _mode: 'code', _value: false} as any,
            jsSetting: true,
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: '9b302942-a0a6-4805-ac47-8f45486a69d4',
      propertyName: 'pnlFiles',
      parentId: 'root',
      label: 'Files',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id:'pnl02942-a0a6-4805-ac47-8f45486a69d4',
        components: [...new DesignerToolbarSettings()        
          .addPropertyAutocomplete({
            id: '3fe73b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            showFillPropsButton: false,
            propertyName: 'ownerName',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Owner',
            jsSetting: true,
          })
          .addTextField({
            id: '1c03863c-880d-4308-8667-c3d996619cb7',
            propertyName: 'ownerId',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Owner Id',
            jsSetting: true,
          })
          .addAutocomplete({
            id: '0009bf13-04a3-49d5-a9d8-1b23df20b97c',
            propertyName: 'ownerType',
            label: 'Owner Type',
            labelAlign: 'right',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            hidden: false,
            dataSourceType: 'url',
            validate: {},
            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
            settingsValidationErrors: [],
            useRawValues: true,
            jsSetting: true,
          })
          .addTextField({
            id: 'db913b1b-3b25-46c9-afef-21854d917ba7',
            propertyName: 'filesCategory',
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            label: 'Files Category',
            jsSetting: true,
          })
          .addEditableTagGroupProps({
            id: nanoid(),
            parentId: 'pnl02942-a0a6-4805-ac47-8f45486a69d4',
            propertyName: 'allowedFileTypes',
            label: 'Allowed File Types',
            description: 'File types that can be accepted.',
            jsSetting: true,
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6f',
      propertyName: 'pnlValidation',
      parentId: 'root',
      label: 'Validation',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id:'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
        components: [...new DesignerToolbarSettings()     
          .addCheckbox({
            id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
            propertyName: 'validate.required',
            parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
            label: 'Required',
          }).toJson()
        ]
      }
    })
    .toJson();
