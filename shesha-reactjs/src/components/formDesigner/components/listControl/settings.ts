import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const listSettingsForm = new DesignerToolbarSettings()
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
    validate: { required: true },
  })
  .addTextField({
    id: '06f18c99-20aa-4d43-9ee2-36bc6c8d2f26',
    name: 'label',
    parentId: 'root',
    label: 'Label',
  })
  .addCheckbox({
    id: '65aef83a-ea37-480a-9d77-ee4f4e229a70',
    name: 'hideLabel',
    parentId: 'root',
    label: 'Hide label?',
    defaultValue: true,
  })
  .addTextField({
    id: '2488beb9-ef4c-44de-b035-f88ccb0889e0',
    name: 'title',
    label: 'Title',
  })
  .addSectionSeparator({
    id: 'a7673729-ffa1-43fd-8ba1-31506fac3e9d',
    name: 'separatorData',
    parentId: 'root',
    label: 'Buttons',
    title: 'Buttons',
  })
  .addButtons({
    id: 'f0eac108-728c-4861-922f-e22d4ff47df8',
    name: 'buttons',
    label: '',
  })
  .addCheckbox({
    id: '1ada46a8-58cd-4f67-b32a-318f9ac7494d',
    name: 'isButtonInline',
    parentId: 'root',
    label: 'Is Button Inline',
  })
  .addSectionSeparator({
    id: '6b995198-8f53-4c9a-8614-926c7f654928',
    name: 'separatorData',
    parentId: 'root',
    label: '',
    title: '',
  })
  .addCheckbox({
    id: '49b76c8f-c26f-48f9-8122-aa94dfe53b98',
    name: 'bordered',
    parentId: 'root',
    label: 'Bordered',
  })
  .addSectionSeparator({
    id: '14a4ff65-25a1-487b-bb2a-af287f3b1293',
    name: 'separatorData',
    parentId: 'root',
    label: 'Data',
    title: '',
  })
  .addCheckbox({
    name: 'allowAddAndRemove',
    label: 'Allow Add/Remove Items',
    id: '5179483d-602e-47cd-9d98-383a35dbac58',
    description: 'Whether a list should allow you to add to or remove from it',
  })
  .addDropdown({
    id: 'f3d38650-475c-45fd-a748-3b336e6e9f77',
    name: 'dataSource',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    description: 'The list data to be used can be the data that comes with the form of can be fetched from the API',
    label: 'Data source',
    useRawValues: false,
    dataSourceType: 'values',
    values: [
      { id: 'e98bd235-04c9-4acf-b4e2-d45ee7f64195', label: 'form', value: 'form' },
      { id: 'f6f884b2-57f0-4246-83fa-0c12931b1320', label: 'api', value: 'api' },
    ],
  })
  .addCodeEditor({
    name: 'dataSourceUrl',
    id: '6b4457b6-4127-4a2b-8902-f359ddd8c499',
    mode: 'inline',
    label: 'API Url',
    customVisibility: "return data.dataSource ==='api'",
    description: 'The API url that will be used to fetch the list data. Write the code that returns the string',
    exposedVariables: [
      {
        id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
        name: 'data',
        description: 'Form data',
        type: 'object',
      },
      {
        id: '65b71112-d412-401f-af15-1d3080f85319',
        name: 'globalState',
        description: 'The global state',
        type: 'object',
      },
      {
        id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
        name: 'queryParams',
        description: 'Query parameters',
        type: 'object',
      },
    ],
  })
  .addSectionSeparator({
    id: '059a3c08-2552-4587-bf6c-a75f98a551a3',
    name: 'separatorRenderStrategy',
    parentId: 'root',
    label: 'Render',
    title: '',
  })
  .addDropdown({
    id: 'c1ce809e-14f0-4a31-b914-6971d62ec532',
    name: 'renderStrategy',
    parentId: 'root',
    hidden: false,
    customVisibility: null,
    description:
      'Which form should be used to render the data? If current form, you can drag items, else specify form path',
    label: 'Render Strategy',
    useRawValues: false,
    dataSourceType: 'values',
    defaultValue: 'dragAndDrop',
    values: [
      { id: '1b2cd084-11c3-4437-a681-672ed5ebb296', label: 'Drag And Drop', value: 'dragAndDrop' },
      { id: 'bfb75690-d6f6-414e-b4de-4156d2038265', label: 'External Form', value: 'externalForm' },
    ],
  })
  .addAutocomplete({
    id: 'f722680e-1ae6-4050-82ce-171f27e96d56',
    name: 'formId',
    parentId: 'root',
    hidden: false,
    customVisibility: "return data.renderStrategy === 'externalForm'",
    description: 'Specify the form that will be rendered on this list component',
    label: 'Form Path',
    useRawValues: true,
    dataSourceType: 'entitiesList',
    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
    entityTypeShortAlias: 'Shesha.Framework.Form',
    queryParams: [],
  })
  .addSectionSeparator({
    id: 'f12b7eec-f0f2-4e2c-af9e-3494e767e2d8',
    name: 'separatorData',
    parentId: 'root',
    label: 'Submit',
    title: '',
  })
  .addCheckbox({
    id: '6a528a62-537a-4a89-a2f1-fc2ea6f5caf7',
    name: 'allowSubmit',
    label: 'Allow submit',
    description: 'Whether you should be able to save the items individually on the server',
  })
  .addContainer({
    id: '',
    components: new DesignerToolbarSettings()
      .addCodeEditor({
        name: 'submitUrl',
        id: 'b469c1f1-8c47-457b-a7d5-5f323b3bc4a6',
        mode: 'dialog',
        label: 'API Url',
        exposedVariables: [
          {
            id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
            name: 'data',
            description: 'Form data',
            type: 'object',
          },
          {
            id: '65b71112-d412-401f-af15-1d3080f85319',
            name: 'globalState',
            description: 'The global state',
            type: 'object',
          },
          {
            id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
            name: 'queryParams',
            description: 'Query parameters',
            type: 'object',
          },
        ],
      })
      .addDropdown({
        id: '93faedae-f34c-438f-8eba-a2ce4a665b81',
        name: 'submitHttpVerb',
        parentId: '6a528a62-537a-4a89-a2f1-fc2ea6f5caf7',
        hidden: false,
        customVisibility: null,
        label: 'Submit verb',
        useRawValues: false,
        defaultValue: 'POST',
        dataSourceType: 'values',
        description: 'Write  a code that returns the string that represent the url to be used to save the items',
        values: [
          { id: '567e3695-4fcb-4b6a-ac0f-d2f6178ab26a', label: 'POST', value: 'POST' },
          { id: '65cbbb08-ac5a-4bff-96b9-7d8a6b35122a', label: 'PUT', value: 'PUT' },
        ],
        validate: { required: true },
      })
      .addCodeEditor({
        name: 'onSubmit',
        id: '7ac1ce68-52ff-4923-a89a-fc875784ec0d',
        mode: 'dialog',
        label: 'On Submit',
        description: 'Write a code that return tha payload to be sent to the server when submitting this items',
        exposedVariables: [
          {
            id: 'e964ed28-3c2c-4d02-b0b7-71faf243eb53',
            name: 'items',
            description: 'List of items',
            type: 'array',
          },
          {
            id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
            name: 'data',
            description: 'Form data',
            type: 'object',
          },
          {
            id: '65b71112-d412-401f-af15-1d3080f85319',
            name: 'globalState',
            description: 'The global state',
            type: 'object',
          },
          {
            id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
            name: 'queryParams',
            description: 'Query parameters',
            type: 'object',
          },
        ],
      })
      .toJson(),
    name: '',
    direction: 'vertical',
    customVisibility: 'return data.allowSubmit',
  })
  .addSectionSeparator({
    id: 'd9f673f9-dd6c-4816-afe4-3a58849b528d',
    name: 'separatorFilters',
    parentId: 'root',
    label: 'Customize filters',
    title: '',
  })
  .addQueryBuilder({
    id: '564a68ae-1ec6-47ee-a2e1-90ca0346bf6d',
    name: 'filter',
    label: 'Query Builder',
  })
  .addSectionSeparator({
    id: 'e9331f4e-8c39-4dd1-9cbc-fa4f3fba17d3',
    name: 'separatorLayout',
    parentId: 'root',
    label: 'Layout',
    title: '',
  })
  .addNumberField({
    id: '74e583ef-5c01-4353-ab6e-fff13b2cfbbc',
    name: 'labelCol',
    label: 'Label Col',
    defaultValue: 5,
    min: 1,
    max: 24,
  })
  .addNumberField({
    id: 'b7e60182-bb85-4389-bf75-72dda0d35383',
    name: 'wrapperCol',
    label: 'Wrapper Col',
    defaultValue: 13,
    min: 1,
    max: 24,
  })
  .addSectionSeparator({
    id: 'a6938bc7-d635-4f85-8773-709fe29cc614',
    name: 'separatorPagination',
    parentId: 'root',
    label: 'Pagination',
    title: '',
  })
  .addCheckbox({
    id: 'c94b5f19-094d-479d-991b-f24c7768bdf5',
    name: 'showPagination',
    parentId: 'root',
    label: 'Show pagination',
    defaultValue: true,
  })
  .addNumberField({
    id: '88d20d79-0880-4f0c-80ba-b61d5bea6060',
    name: 'paginationDefaultPageSize',
    label: 'Default page size',
    defaultValue: 5,
    min: 5,
    stepNumeric: 5,
    max: 50,
    customVisibility: 'return data.showPagination;',
  })
  .addNumberField({
    id: 'a4f29344-e5e1-4051-8262-07ef3f7a0af6',
    name: 'maxHeight',
    label: 'Max height',
    defaultValue: 400,
    min: 200,
    customVisibility: 'return !data.showPagination;',
  })
  .addSectionSeparator({
    id: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
    name: 'separatorVisibility',
    parentId: 'root',
    label: 'Visibility',
    title: 'Visibility',
  })
  .addCodeEditor({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    name: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    description:
      'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
    mode: 'inline',
  })
  .toJson();
