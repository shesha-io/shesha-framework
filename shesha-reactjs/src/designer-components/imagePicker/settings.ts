import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () =>
  new DesignerToolbarSettings()
    .addCollapsiblePanel({
      id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnl',
      parentId: 'root',
      label: 'Display',
      labelAlign: "right",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
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
          })
          .addDropdown({
            id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
            propertyName: 'labelAlign',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
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
            propertyName: 'description',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Description',
          })
          .addCheckbox({
            id: '53cd10ce-25af-474b-af75-8e7b1f19e52d',
            propertyName: 'isDragger',
            label: 'Is dragger',
            parentId: 'root',
            description: 'Whether the uploader should show a dragger instead of button',
          })
          .addCheckbox({
            id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
            propertyName: 'hidden',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'hide',
          })
          .addCheckbox({
            id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
            propertyName: 'hideLabel',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Hide Label',
          })
          .addEditMode({
            id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
            propertyName: 'editMode',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            label: "Edit mode",
          })
          .addCheckbox({
            id: 'f4193290-3bc7-441a-92be-cfaf25d57c28',
            propertyName: 'allowUpload',
            label: 'Allow Upload',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
            validate: {},
          })
          .addCheckbox({
            id: 'b0d75145-3f7c-424d-a1ac-c65990b4f749',
            propertyName: 'allowReplace',
            label: 'Allow Replace',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
            validate: {},
          })
          .addCheckbox({
            id: '88697971-8945-420e-959b-46493f9955f9',
            propertyName: 'allowDelete',
            label: 'Allow Delete',
            parentId: 'abc54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
            validate: {},
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
        id: 'abc5bfe4-ee69-431e-931b-b0e0b9ceee6f',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: 'abc5bfe4-ee69-431e-931b-b0e0b9ceee6f',
            propertyName: 'validate.required',
            parentId: 'root',
            label: 'Required',
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
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
        components: [...new DesignerToolbarSettings()
          .addCheckbox({
            id: 'af3d9a3f-f47e-48ae-b4c3-f5cc36e534d9',
            propertyName: 'useSync',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Synchronous upload',
          })
          .addTextField({
            id: '417ee22e-a49d-44f2-a1c7-fef32ec87503',
            propertyName: 'ownerId',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Owner Id',
          })
          .addAutocomplete({
            id: 'c6ecd70c-7419-4ea7-a715-d42699d26e6e',
            propertyName: 'ownerType',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            label: 'Owner Type',
            labelAlign: 'right',
            dataSourceType: 'url',
            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
            displayPropName: 'displayText',
            keyPropName: 'value',
            mode: 'single',
          })
          .addEditableTagGroupProps({
            id: nanoid(),
            propertyName: 'allowedFileTypes',
            label: 'Allowed File Types',
            parentId: 'abc8b8f9-ec00-4d0a-9d2a-44a630cb2dcb',
            description: 'File types that can be accepted.',
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
