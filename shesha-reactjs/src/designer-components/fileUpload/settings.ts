import { DesignerToolbarSettings } from 'interfaces/toolbarSettings';
import { nanoid } from 'nanoid';

export const getSettings = () =>
  new DesignerToolbarSettings()
    .addCollapsiblePanel({
      id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnl',
      parentId: 'root',
      label: 'Display',
      labelAlign: "right",
      expandIconPosition: "left",
      ghost: true,
      collapsible: 'header',
      content: {
        id:'abc54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addContextPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'propertyName',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Property name',
            validate: {
              required: true,
            },
          })
          .addTextField({
            id: '46d07439-4c18-468c-89e1-60c002ce96c5',
            propertyName: 'label',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Label',
            jsSetting: true,
          })
          .addDropdown({
            id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
            propertyName: 'labelAlign',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Label align',
            jsSetting: true,
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
            propertyName: 'description',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Description',
            jsSetting: true,
          })
          .addDropdown({
            id: 'df8a8f35-a50b-42f9-9642-73d390ceddbf',
            propertyName: 'visibility',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
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
          })
          .addCheckbox({
            id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
            propertyName: 'hidden',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hidden',
            jsSetting: true,
          })
          .addCheckbox({
            id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
            propertyName: 'hideLabel',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hide Label',
            jsSetting: true,
          })
          .addCheckbox({
            id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
            propertyName: 'disabled',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Disabled',
            jsSetting: true,
          })
          .addCheckbox({
            id: 'f4193290-3bc7-441a-92be-cfaf25d57c28',
            propertyName: 'allowUpload',
            label: 'Allow Upload',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: false,
            customVisibility: 'return !data.disabled',
            validate: {},
            jsSetting: true,
          })
          .addCheckbox({
            id: 'b0d75145-3f7c-424d-a1ac-c65990b4f749',
            propertyName: 'allowReplace',
            label: 'Allow Replace',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: false,
            customVisibility: 'return !data.disabled',
            validate: {},
            jsSetting: true,
          })
          .addCheckbox({
            id: '88697971-8945-420e-959b-46493f9955f9',
            propertyName: 'allowDelete',
            label: 'Allow Delete',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: false,
            customVisibility: 'return !data.disabled',
            validate: {},
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
      expandIconPosition: "left",
      ghost: true,
      collapsible: 'header',
      content: {
        id:'abc5bfe4-ee69-431e-931b-b0e0b9ceee6f',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: 'abc5bfe4-ee69-431e-931b-b0e0b9ceee6f',
            propertyName: 'validate.required',
            parentId: 'root',
            label: 'Required',
            jsSetting: true,
          }).toJson()
        ]
      }
    })

    .addCollapsiblePanel({
      id: '5478b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
      propertyName: 'pnlFiles',
      parentId: 'root',
      label: 'Files',
      labelAlign: "right",
      expandIconPosition: "left",
      ghost: true,
      collapsible: 'header',
      content: {
        id:'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: 'af3d9a3f-f47e-48ae-b4c3-f5cc36e534d9',
            propertyName: 'useSync',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Synchronous upload',
            jsSetting: true,
          })
          .addTextField({
            id: '417ee22e-a49d-44f2-a1c7-fef32ec87503',
            propertyName: 'ownerId',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Owner Id',
            jsSetting: true,
          })
          .addTextField({
            id: 'c6ecd70c-7419-4ea7-a715-d42699d26e6e',
            propertyName: 'ownerType',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Owner Type',
            jsSetting: true,
          })
          .addTextField({
            id: '124a3c72-452b-4fc3-82d8-e006ef541493',
            propertyName: 'propertyName',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Property Name',
            customVisibility: 'return !data.list',
            jsSetting: true,
          })
          .addEditableTagGroupProps({
            id: nanoid(),
            propertyName: 'allowedFileTypes',
            label: 'Allowed File Types',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            description: 'File types that can be accepted.',
            jsSetting: true,
          }).toJson()
        ]
      }
    })
    .toJson();
