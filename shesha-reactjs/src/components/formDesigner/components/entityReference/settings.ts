import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const getSettings = (data: { readOnly?: boolean }) => new DesignerToolbarSettings(data)
  .addSectionSeparator({
    id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
    title: '',
  })
  .addPropertyAutocomplete({
    id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true }
  })
  .addTextField({
    id: '46d07439-4c18-468c-89e1-60c002ce96c5',
    name: 'label',
    parentId: 'root',
    label: 'Label',
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
  .addSectionSeparator({
    id: 'adfa4bf6-f76d-4139-a850-c99bf06c23de',
    name: 'separator1',
    parentId: 'root',
    label: 'Entity reference configuration',
  })
  .addTextField({
    id: '590c7439-4c18-468c-89e1-60c002ce96c5',
    name: 'placeholder',
    parentId: 'root',
    label: 'Placeholder',
  })
  .addEndpointsAutocomplete({
    id: '7777d9c6-6a53-4a05-9de0-ad1b17eb0018',
    name: 'getEntityUrl',
    label: 'Get entity URL',
    labelAlign: 'right',
    parentId: 'root',
  })
  .addAutocomplete({
    id: '6b0bd9c6-6a53-4a05-9de0-ad1b17eb0018',
    name: 'entityType',
    label: 'Entity Type',
    labelAlign: 'right',
    parentId: 'root',
    dataSourceType: 'url',
    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
    useRawValues: true,
  })
  .addPropertyAutocomplete({
    id: '2479d9c6-6a53-4a05-9de0-ad1b17eb0018',
    name: 'displayProperty',
    label: 'Display property',
    labelAlign: 'right',
    parentId: 'root',
    modelType: '{{data.entityType}}',
    isDynamic: false,
    description: 'Name of the property that should be displayed in the field',
  })
  .addDropdown({
    id: 'ffaa8f35-a50b-42f9-9642-123490ceddbf',
    name: 'formSelectionMode',
    parentId: 'root',
    label: 'Form selection mode',
    allowClear: false,
    defaultValue: 'dynamic',
    onChange: '(value) => { data.formType = data.formSelectionMode == "dynamic" ? (data.entityReferenceType == "Quickview" ? "Quickview" : "Details") : data.formType; }',
    values: [
      {
        label: 'Name',
        value: 'name',
        id: '111f10ce-26af-474b-af75-8e7b1f19e51d',
      },
      {
        label: 'Dynamic',
        value: 'dynamic',
        id: '222d228c-cb9c-4da7-a8bc-bc2be518a058',
      },
    ],
    dataSourceType: 'values',
  })
  .addFormAutocomplete({
    id: '3357d9c6-6a53-4a05-9de0-ad1b17eb0018',
    name: 'formIdentifier',
    label: 'Form Id',
    labelAlign: 'right',
    parentId: 'root',
    isDynamic: false,
    convertToFullId: true,
    customVisibility: 'return data.formSelectionMode == "name";'
  })
  .addTextField({
    id: '864c7439-4c18-468c-89e1-60c002ce96c5',
    name: 'formType',
    parentId: 'root',
    label: 'Form Type',
    customVisibility: 'return data.formSelectionMode == "dynamic";'
  })
  .addDropdown({
    id: 'ddea8f35-a50b-42f9-9642-123490ceddbf',
    name: 'entityReferenceType',
    parentId: 'root',
    label: 'Entity Reference Type',
    allowClear: false,
    defaultValue: 'Quickview',
    onChange: 'data.formType = data.formSelectionMode == "dynamic" ? (data.entityReferenceType == "Quickview" ? "Quickview" : "Details") : data.formType;',
    values: [
      {
        label: 'Navigate Link',
        value: 'NavigateLink',
        id: '325f10ce-26af-474b-af75-8e7b1f19e51d',
      },
      {
        label: 'Quickview',
        value: 'Quickview',
        id: 'ffed228c-cb9c-4da7-a8bc-bc2be518a058',
      },
      {
        label: 'Modal dialog box',
        value: 'Dialog',
        id: 'a6fb82ee-2eee-47ec-bab9-4cba52b970a0',
      },
    ],
    dataSourceType: 'values',
  })
  .addSectionSeparator({
    id: 'a1f97ae0-a8d9-48b9-940c-d0f159412345',
    name: 'separatorQuickview',
    parentId: 'root',
    label: 'Quickview settings',
    title: 'Quickview settings',
    customVisibility: 'return data.entityReferenceType == "Quickview";'
  })
  .addNumberField({
    id: '12347439-4c18-468c-89e1-60c002ce96c5',
    name: 'quickviewWidth',
    parentId: 'root',
    label: 'Quickview width',
    customVisibility: 'return data.entityReferenceType == "Quickview";'
  })
  .addSectionSeparator({
    id: 'a1f97ae0-a8d9-48b9-940c-d0f159454321',
    name: 'separatorDialog',
    parentId: 'root',
    label: 'Dialog settings',
    title: 'Dialog settings',
    customVisibility: 'return data.entityReferenceType == "Dialog";'
  })
  .addTextField({
    id: '4b3b0da0-f126-4e37-b5f5-568367dc008f',
    name: 'modalTitle',
    label: 'Title',
    labelAlign: 'right',
    parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
    hidden: false,
    version: 0,
    textType: 'text',
    customVisibility: 'return data.entityReferenceType == "Dialog";'
  })
  .addCheckbox({
    id: '43c5fcb7-a2d4-46d7-b671-6eac73e8d95c',
    name: 'showModalFooter',
    parentId: '2a5acbcf-cd52-487e-9cd7-09594a04793a',
    label: 'Show Modal Buttons',
    // "defaultChecked":false
    customVisibility: 'return data.entityReferenceType == "Dialog";'
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
    customVisibility: 'return data.entityReferenceType == "Dialog" && data.showModalFooter === true',
    defaultValue: ['POST'],
  })
  .addLabelValueEditor({
    id: 'b395c0e9-dbc1-44f1-8fef-c18a49442871',
    name: 'additionalProperties',
    label: 'Additional properties',
    labelTitle: 'Key',
    labelName: 'key',
    valueTitle: 'Value',
    valueName: 'value',
    customVisibility: 'return data.entityReferenceType == "Dialog";',
    description:
      'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. Also note you can use Mustache expression like {{id}} for value property',
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
    customVisibility: 'return data.entityReferenceType == "Dialog";',
    dataSourceType: 'values',
  })
  .addDropdown({
    id: '264903ff-b525-4a6e-893f-ffffb219df9d',
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
    customVisibility: 'return data.entityReferenceType == "Dialog" && data.modalWidth === "custom"',
  })
  .addNumberField({
    id: '264903ff-b525-4a6e-893f-aaaab219df9d',
    name: 'customWidth',
    label: 'Enter Custom Width',
    customVisibility: 'return data.entityReferenceType == "Dialog" && data.modalWidth === "custom" && data.widthUnits',
    min: 0,
  })
  .addSwitch({
    id: '87654321-f15e-437b-98b6-84d6a1fbf801',
    name: 'handleSuccess',
    parentId: 'root',
    label: 'Handle Success',
    customVisibility: 'return data.entityReferenceType == "Dialog";',
  })
  .addCollapsiblePanel({
    id: '09876543-b525-4a6e-893f-aaaab219df9d',
    name: '',
    label: 'On Success handler',
    customVisibility: 'return data.entityReferenceType == "Dialog" && data.handleSuccess;',
    components: new DesignerToolbarSettings(data)
      .addConfigurableActionConfigurator({
        id: 'a1f97ae0-a8d9-cccc-940c-d0f15946469e',
        name: 'onSuccess',
        label: 'On Success',
      }).toJson()
  })
  .addSwitch({
    id: '12345678-f15e-437b-98b6-84d6a1fbf801',
    name: 'handleFail',
    parentId: 'root',
    label: 'Handle Fail',
    customVisibility: 'return data.entityReferenceType == "Dialog";',
  })
  .addCollapsiblePanel({
    id: '01928374-b525-4a6e-893f-aaaab219df9d',
    name: '',
    label: 'On Fail handler',
    customVisibility: 'return data.entityReferenceType == "Dialog" && data.handleFail;',
    components: new DesignerToolbarSettings(data)
      .addConfigurableActionConfigurator({
        id: 'a1f97ae0-a8d9-ffff-940c-d0f15946469e',
        name: 'onFail',
        label: 'On Fail',
      }).toJson()
  })
  .addSectionSeparator({
    id: 'a1f97ae0-a8d9-48b9-940c-d0f15946469e',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
    title: 'Visibility',
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
        label: 'Removed (Remove from UI and exlude from payload)',
        value: 'Removed',
        id: '3b6282ee-2eee-47ec-bab9-4cba52b970a0',
      },
    ],
    dataSourceType: 'values',
  })
  .addCheckbox({
    id: '1ceb3851-f15e-437b-98b6-84d6a1fbf801',
    name: 'readOnly',
    parentId: 'root',
    label: 'Read Only',
  })
  .addCheckbox({
    id: 'c6885251-96a6-40ce-99b2-4b5209a9e01c',
    name: 'hideLabel',
    parentId: 'root',
    label: 'Hide Label',
  })
  .addCheckbox({
    id: '148e12c0-41a0-4fa2-8c64-8f6dd5213a3e',
    name: 'disabled',
    label: 'Disabled',
    parentId: 'root',
  })
  .addCodeEditor({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
  })
  .addCodeEditor({
    id: '36219ffd-cadb-496c-bf6d-b742f7f6ed55',
    name: 'customEnabled',
    parentId: 'root',
    label: 'Custom Enabled',
    description:
      'Enter custom enabled code. You must return true to enable the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
  })
.toJson();
