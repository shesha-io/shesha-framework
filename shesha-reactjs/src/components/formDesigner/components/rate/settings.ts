import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addPropertyAutocomplete({
      id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
      propertyName: 'propertyName',
      parentId: 'root',
      label: 'Property name',
      validate: { required: true },
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
    .addNumberField({
      id: '971b2e8a-51e4-4289-bc65-185619eb56be',
      propertyName: 'count',
      parentId: 'root',
      label: 'Count',
    })
    .addIconPicker({
      id: '152f3d72-68fb-43ab-adf6-8cf7d11fe6e1',
      propertyName: 'icon',
      label: 'Icon',
      parentId: 'root',
    })
    .addTextArea({
      id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
      propertyName: 'description',
      parentId: 'root',
      label: 'Description',
    })
    .addDropdown({
      id: 'df8a8f35-a50b-42f9-9642-73d390ceddbf',
      propertyName: 'visibility',
      parentId: 'root',
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
      parentId: 'root',
      label: 'Hidden',
    })
    .addCheckbox({
      id: '1ceb3851-f15e-437b-98b6-84d6a1fbf801',
      propertyName: 'readOnly',
      parentId: 'root',
      label: 'Read Only',
    })
    .addCheckbox({
      id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
      propertyName: 'hideLabel',
      parentId: 'root',
      label: 'Hide Label',
    })
    .addCheckbox({
      id: '148e12c0-41a0-4fa2-8c64-8f6dd5213a3e',
      propertyName: 'disabled',
      label: 'Disabled',
      parentId: 'root',
    })
    .addSectionSeparator({
      id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
      propertyName: 'separatorEvent',
      parentId: 'root',
      label: 'Event',
    })
    .addCodeEditor({
      id: 'b9269416-3b78-42c4-934e-3e0dac8c7f01',
      propertyName: 'onChangeCustom',
      label: 'On Change',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customVisibility: null,
      description: 'Enter custom even handler on changing of event. (form, value, option) are exposed',
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
          id: 'ea91590e-57d8-49fe-837a-c09c1e20bb06',
          name: 'option',
          description: 'Meta data of component current value',
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
          "propertyName": "setGlobalState",
          "description": "Setting the global state of the application",
          "type": "(payload: { key: string, data: any } ) => void"
        }
      ],
    })
    .addSectionSeparator({
      id: '6d5a81bb-316b-41ec-8da5-6c61310f0311',
      propertyName: 'separatorStyle',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: '987c3de1-b959-4670-96f6-9b1747189a6e',
      propertyName: 'style',
      label: 'Style',
      parentId: 'root',
      mode: 'dialog',
    })
    .addSectionSeparator({
      id: 'a1f97ae0-a8d9-48b9-940c-d0f15946469e',
      propertyName: 'separatorVisibility',
      parentId: 'root',
      label: 'Visibility',
    })
    .addCodeEditor({
      id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
      propertyName: 'customVisibility',
      parentId: 'root',
      label: 'Custom Visibility',
      description:
        'Enter custom visibility code.  You must return true to show the component. ' + 
        'The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    })
    .toJson();
