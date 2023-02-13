import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const entityPickerSettings = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
  })
  .addPropertyAutocomplete({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: {
      required: true,
    },
  })
  .addTextField({
    id: '46d07439-4c18-468c-89e1-60c002ce96c5',
    name: 'label',
    parentId: 'root',
    label: 'Label',
    version: 0,
    textType: 'text',
  })
  .addDropdown({
    id: '57a40a33-7e08-4ce4-9f08-a34d24a83338',
    name: 'labelAlign',
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
  .addTextArea({
    id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
    name: 'description',
    parentId: 'root',
    label: 'Description',
  })
  .addDropdown({
    id: '1692d566-fe48-43bd-84e0-28b7103354c1',
    name: 'mode',
    parentId: 'root',
    label: 'Mode',
    hidden: false,
    values: [
      {
        label: 'single',
        value: 'single',
        id: '329a001c-3c42-44b2-8616-a8fde0959323',
      },
      {
        label: 'multiple',
        value: 'multiple',
        id: '722eb4ea-9e00-4f4e-addb-e7300fa0c74c',
      },
    ],
    dataSourceType: 'values',
    defaultValue: ['single'],
  })
  .addAutocomplete({
    id: '6b0bd9c6-6a53-4a05-9de0-ad1b17eb0018',
    name: 'entityType',
    label: 'Entity Type',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    dataSourceType: 'url',
    validate: {},
    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
    settingsValidationErrors: [],
    useRawValues: true,
    queryParams: null,
  })
  .addPropertyAutocomplete({
    id: 'hpm6rN_aj-L_KaG5MLIZt',
    name: 'displayEntityKey',
    label: 'Display Property',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    visibility: 'Yes',
    customVisibility: 'return data.entityType',
    isDynamic: false,
    description:
      'Name of the property that should be displayed in the field. Live empty to use default display property defined on the back-end.',
    validate: {},
    modelType: '{{data.entityType}}',
    showFillPropsButton: false,
    settingsValidationErrors: [],
  })
  .addSectionSeparator({
    id: '14413162-429e-451c-b3e6-b3f0ab6d7b09',
    name: 'sectionFilters',
    parentId: 'root',
    label: 'Filters',
  })
  .addCheckbox({
    id: '3ef48a94-a16a-4e89-a514-7713348b560e',
    name: 'useExpression',
    label: 'Use Expression',
    parentId: 'root',
    hidden: false,
    customVisibility: 'return Boolean(data.entityType);',
    validate: {},
  })
  .addQueryBuilder({
    id: 'n4enebtmhFgvkP5ukQK1f',
    name: 'filters',
    label: 'Entity Filter',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    customVisibility: 'return Boolean(data.entityType);',
    isDynamic: false,
    validate: {},
    settingsValidationErrors: [],
    useExpression: '{{data.useExpression}}',
    modelType: '{{data.entityType}}',
    fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
  })
  .addSectionSeparator({
    id: '253ee0fd-9916-4728-9f93-16ecc1ca3bb9',
    name: 'sectionFilters',
    parentId: 'root',
    label: '',
  })
  .addCheckbox({
    id: '11148a94-a16a-4e89-a514-7713348b560e',
    name: 'useRawValues',
    label: 'Use Raw Values',
    parentId: 'root',
    hidden: false,
    validate: {},
  })
  .addSectionSeparator({
    id: '253ee0fd-9916-4728-9f93-16ecc1ca3bb9',
    name: 'sectionFilters',
    parentId: 'root',
    label: '',
  })
  .addEntityPickerColumnsEditor({
    id: '2a6ee3b0-15f1-4521-cc6e-6a1c9d192ce2',
    name: 'items',
    parentId: 'root',
    label: 'Columns',
    customVisibility: 'return data.entityType',
    items: [],
  })
  .addDropdown({
    id: 'df8a8f35-a50b-42f9-9642-73d390ceddbf',
    name: 'visibility',
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
        label: 'Removed (Remove from UI and exclude from payload)',
        value: 'Removed',
        id: '3b6282ee-2eee-47ec-bab9-4cba52b970a0',
      },
    ],
    dataSourceType: 'values',
  })
  .addCheckbox({
    id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
    name: 'hidden',
    parentId: 'root',
    label: 'Hidden',
  })
  .addCheckbox({
    id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
    name: 'hideLabel',
    parentId: 'root',
    label: 'Hide Label',
  })
  .addCheckbox({
    id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
    name: 'disabled',
    parentId: 'root',
    label: 'Disabled',
  })
  .addCheckbox({
    id: '1ceb3851-f15e-437b-98b6-84d6a1fbf801',
    name: 'readOnly',
    parentId: 'root',
    label: 'Read Only',
  })
  .addSectionSeparator({
    id: 'eb946e7c-5450-48b8-994a-ead765e3d631',
    name: 'separator2',
    parentId: 'root',
    label: 'Data',
  })
  .addCheckbox({
    id: '0cc0b997-f3f7-4a3d-ba36-8590687af9bd',
    name: 'allowNewRecord',
    parentId: 'root',
    label: 'Allow New Record',
  })
  .addCollapsiblePanel({
    id: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
    name: 'pnlModalSettings',
    label: 'Dialogue settings',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    customVisibility: 'return data.allowNewRecord === true',
    validate: {
      required: false,
    },
    components: new DesignerToolbarSettings()
      .addTextField({
        id: '4b3b0da0-f126-4e37-b5f5-568367dc008f',
        name: 'modalTitle',
        label: 'Title',
        labelAlign: 'right',
        parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
        hidden: false,
        customVisibility: null,
        validate: {
          required: true,
        },
        version: 0,
        textType: 'text',
      })
      .addFormAutocomplete({
        id: 'fd3d4ef4-be06-40e9-9815-118754707d0e',
        name: 'modalFormId',
        label: 'Modal form',
        labelAlign: 'right',
        parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
        hidden: false,
        customVisibility: null,
        validate: {
          required: true,
        },
        convertToFullId: false,
      })
      .addCheckbox({
        id: '43c5fcb7-a2d4-46d7-b671-6eac73e8d95c',
        name: 'showModalFooter',
        parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
        label: 'Show Modal Buttons',
        // "defaultChecked":false
      })
      .addDropdown({
        id: 'ea60aee4-a7aa-4fd6-a641-638a5a609157',
        name: 'submitHttpVerb',
        parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
        label: 'Submit Http Verb',
        values: [
          {
            label: 'POST',
            value: 'POST',
            id: '8418606a-d85d-4795-a2ee-4a69fcc656f9',
          },
          {
            label: 'PUT',
            value: 'PUT',
            id: '64bbca8a-2fb1-4448-ab71-3db077233bd2',
          },
        ],
        dataSourceType: 'values',
        customVisibility: 'return data.showModalFooter === true',
        defaultValue: ['POST'],
      })
      .addTextField({
        id: 'e669632e-55e0-46f4-9585-9e81ef0ae174',
        name: 'onSuccessRedirectUrl',
        parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
        label: 'Success Redirect URL',
        customVisibility: 'return data.showModalFooter === true',
        version: 0,
        textType: 'text',
      })
      .addDropdown({
        id: '264903ff-b525-4a6e-893f-d560b219df9d',
        name: 'modalWidth',
        label: 'Dialog Width (%)',
        allowClear: true,
        values: [
          {
            label: 'Small',
            value: '40%',
            id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
          },
          {
            label: 'Medium',
            value: '60%',
            id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
          },
          {
            label: 'Large',
            value: '80%',
            id: '1f2ac3db-3b3f-486c-991f-ad703088ab2d',
          },
          {
            label: 'Custom',
            value: 'custom',
            id: 'fde460b0-1f84-4b64-9a6a-e02ba862937d',
          },
        ],
        dataSourceType: 'values',
      })
      .addDropdown({
        id: nanoid(),
        name: 'widthUnits',
        label: 'Units',
        allowClear: true,
        values: [
          {
            label: 'Percentage (%)',
            value: '%',
            id: '2f56ae38-e5f3-40ff-9830-bc048736ddb4',
          },
          {
            label: 'Pixels (px)',
            value: 'px',
            id: '470d820b-7cd7-439c-8e95-1f5b3134f80c',
          },
        ],
        dataSourceType: 'values',
        customVisibility: 'return data.modalWidth === "custom"',
      })
      .addNumberField({
        id: nanoid(),
        name: 'customWidth',
        label: 'Enter Custom Width',
        customVisibility: 'return data.modalWidth === "custom" && data.widthUnits',
        min: 0,
      })
      .toJson(),
  })
  .addSectionSeparator({
    id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6f',
    name: 'separator3',
    parentId: 'root',
    label: 'Validation',
  })
  .addCheckbox({
    id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
    name: 'validate.required',
    parentId: 'root',
    label: 'Required',
  })
  .addSectionSeparator({
    id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
    name: 'sectionStyle',
    parentId: 'root',
    label: 'Style',
  })
  .addCodeEditor({
    id: '06ab0599-914d-4d2d-875c-765a495472f8',
    name: 'style',
    label: 'Style',
    parentId: 'root',
    validate: {},
    settingsValidationErrors: [],
    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
    exposedVariables: [
      {
        id: nanoid(),
        name: 'data',
        description: 'Form values',
        type: 'object',
      },
    ],
  })
  .addDropdown({
    id: '8615d12f-6ea0-4b11-a1a1-6088c7160fd9',
    name: 'size',
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
  .addSectionSeparator({
    id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
  })
  .addCodeEditor({
    id: '3a0afccc-7d52-468b-843f-62ce57422048',
    name: 'customVisibility',
    label: 'Custom Visibility',
    labelAlign: 'right',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    validate: {},
    settingsValidationErrors: [],
    exposedVariables: [
      {
        id: nanoid(),
        name: 'value',
        description: 'Component current value',
        type: 'string | any',
      },
      { id: nanoid(), name: 'data', description: 'Selected form values', type: 'object' },
    ],
  })
  .toJson();
