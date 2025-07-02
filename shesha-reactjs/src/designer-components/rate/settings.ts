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
          .addContextPropertyAutocomplete({
            id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
            propertyName: 'propertyName',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Property name',
            validate: { required: true },
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
          .addNumberField({
            id: '971b2e8a-51e4-4289-bc65-185619eb56be',
            propertyName: 'count',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Count',
          })
          .addIconPicker({
            id: '152f3d72-68fb-43ab-adf6-8cf7d11fe6e1',
            propertyName: 'icon',
            label: 'Icon',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          })
          .addTextArea({
            id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
            propertyName: 'description',
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            label: 'Description',
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
            id: '148e12c0-41a0-4fa2-8c64-8f6dd5213a3e',
            propertyName: 'editMode',
            label: "Edit mode",
            parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: '21114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlEvent',
      parentId: 'root',
      label: 'Event',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: '2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addCodeEditor({
            id: 'b9269416-3b78-42c4-934e-3e0dac8c7f01',
            propertyName: 'onChangeCustom',
            label: 'On Change',
            labelAlign: 'right',
            parentId: '2pnl54bf6-f76d-4139-a850-c99bf06c8b69',
            hidden: false,
            description: 'Enter custom eventhandler on changing of event. (form, value, option) are exposed',
            validate: {},
            settingsValidationErrors: [],
            exposedVariables: [
              {
                id: '374a28a4-b86e-4219-8071-4032154a040a',
                name: 'data',
                description: 'Selected form values',
                type: 'object',
              },
              {
                id: 'cba41d1b-6a43-46ec-8d0b-61b46c2a19d4',
                name: 'form',
                description: 'Form instance',
                type: 'FormInstance',
              },
              {
                id: 'fb1db16a-564e-4518-bc28-1380f1a80387',
                name: 'formMode',
                description: 'The form mode',
                type: "'readonly' | 'edit' | 'designer'",
              },
              {
                id: '789d0d0e-f489-4b7d-b67d-b3e86c82c37b',
                name: 'globalState',
                description: 'The global state of the application',
                type: 'object',
              },
              {
                id: 'bc5c08aa-621c-4b5b-98ed-cfc58800cb64',
                name: 'http',
                description: 'axios instance used to make http requests',
                type: 'object',
              },
              {
                id: '7772f2ac-301c-4128-9ccc-6bd2c647f762',
                name: 'message',
                description:
                  'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
                type: 'object',
              },
              {
                id: 'e056ac8b-8540-4141-ade7-3f4739fde9be',
                name: 'moment',
                description: 'The moment.js object',
                type: 'object',
              },
              {
                id: '8d1541db-2591-4568-b925-d7777cea8f0f',
                name: 'value',
                description: 'Component current value',
                type: 'string | any',
              },
              {
                id: '8d1541db-2591-4568-b925-d7777cea7f0f',
                name: 'setFormData',
                description: 'A function used to update the form data',
                type: '({ values: object, mergeValues: boolean}) => void',
              },
              {
                id: '8d1541db-2151-4568-b925-d8777cea7f0f',
                "name": "setGlobalState",
                "description": "Setting the global state of the application",
                "type": "(payload: { key: string, data: any } ) => void"
              }
            ],
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'onChange'
            },
            availableConstantsExpression: async ({ metadataBuilder }) => {
              return metadataBuilder
                .object("constants")
                .addAllStandard()
                .addObject("value", "Component current value", undefined)
                .build();
            },
          }).toJson()
        ]
      }
    })
    .addCollapsiblePanel({
      id: '31114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlStyle',
      parentId: 'root',
      label: 'Style',
      labelAlign: "left",
      expandIconPosition: "start",
      ghost: true,
      collapsible: 'header',
      content: {
        id: '3pnl4bf6-f76d-4139-a850-c99bf06c8b69',
        components: [...new DesignerToolbarSettings()
          .addCodeEditor({
            id: '987c3de1-b959-4670-96f6-9b1747189a6e',
            propertyName: 'style',
            label: 'Style',
            parentId: '3pnl4bf6-f76d-4139-a850-c99bf06c8b69',
            mode: 'dialog',
            wrapInTemplate: true,
            templateSettings: {
              functionName: 'getStyle'
            },
            availableConstantsExpression: async ({ metadataBuilder }) => {
              return metadataBuilder
                .object("constants")
                .addStandard(["shesha:formData", "shesha:globalState"])
                .build();
            },
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
