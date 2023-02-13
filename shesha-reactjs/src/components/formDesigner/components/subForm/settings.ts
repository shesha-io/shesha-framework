import { DesignerToolbarSettings } from '../../../../interfaces/toolbarSettings';

export const alertSettingsForm = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'c367c411-e7cb-4cc4-b728-b21a51074920',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
    title: '',
  })
  .addPropertyAutocomplete({
    id: 'e602b791-2352-4858-98c2-b4eb7377e1c9',
    name: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
  })
  .addAutocomplete({
    id: '8ca1a702-861d-45a8-826f-71c21ae7e3fb',
    name: 'formId',
    parentId: 'root',
    hidden: false,
    description: 'Specify the form that will be rendered on this list component',
    label: 'Form Path',
    useRawValues: true,
    dataSourceType: 'entitiesList',
    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
    entityTypeShortAlias: 'Shesha.Framework.Form',
    queryParams: [],
  })
  .addDropdown({
    id: '4453863e-43ac-4d3a-b9d5-2b54c269a233',
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
    name: 'beforeGet',
    id: 'e33ac7e2-ccde-4e73-9525-012dcf605742',
    mode: 'dialog',
    label: 'On Submit',
    description: '',
    exposedVariables: [
      {
        id: '31fa28f1-9d44-4023-b822-aca9fe6155c3',
        name: 'data',
        description: 'Form data',
        type: 'object',
      },
      {
        id: 'd58b9841-0cb6-4ed1-b371-b5c1835abdc7',
        name: 'globalState',
        description: 'The global state',
        type: 'object',
      },
      {
        id: 'd76ba132-7c9b-422b-8c42-2fecce08ed0f',
        name: 'queryParams',
        description: 'Query parameters',
        type: 'object',
      },
    ],
  })
  .addCodeEditor({
    name: 'onCreated',
    id: 'a066e195-e192-46fc-a05d-28b5088c3679',
    mode: 'dialog',
    label: 'On Submit',
    description: '',
    exposedVariables: [
      {
        id: '31fa28f1-9d44-4023-b822-aca9fe6155c3',
        name: 'data',
        description: 'Form data',
        type: 'object',
      },
      {
        id: 'd58b9841-0cb6-4ed1-b371-b5c1835abdc7',
        name: 'globalState',
        description: 'The global state',
        type: 'object',
      },
      {
        id: 'd76ba132-7c9b-422b-8c42-2fecce08ed0f',
        name: 'queryParams',
        description: 'Query parameters',
        type: 'object',
      },
    ],
  })
  .addCodeEditor({
    name: 'beforeGet',
    id: 'onUpdated',
    mode: 'dialog',
    label: 'On Submit',
    description: '',
    exposedVariables: [
      {
        id: '31fa28f1-9d44-4023-b822-aca9fe6155c3',
        name: 'data',
        description: 'Form data',
        type: 'object',
      },
      {
        id: 'd58b9841-0cb6-4ed1-b371-b5c1835abdc7',
        name: 'globalState',
        description: 'The global state',
        type: 'object',
      },
      {
        id: 'd76ba132-7c9b-422b-8c42-2fecce08ed0f',
        name: 'queryParams',
        description: 'Query parameters',
        type: 'object',
      },
    ],
  })
  .toJson();
