import { DesignerToolbarSettings } from '../../../../interfaces';
import { ITimelineProps } from './timeline';

export const getSettings = (_data?: ITimelineProps) =>
  new DesignerToolbarSettings()
    .addPropertyAutocomplete({
      id: '14817287-cfa6-4f8f-a998-4eb6cc7cb818',
      name: 'name',
      label: 'Name',
      labelAlign: 'right',
      parentId: 'root',
    })
    .addCodeEditor({
      id: '377bbbee-d7f6-42bf-8f08-fc9303424518',
      name: 'customEnabled',
      label: 'Custom Enabled',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      customEnabled: null,
      description:
        'Enter custom enabled code.  You must return true to enable the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
      validate: {},
      settingsValidationErrors: [],
      exposedVariables: [
        {
          id: 'b466ad1e-a329-4fd1-a40d-10aec4324001',
          name: 'globalState',
          description: 'The Global state',
          type: 'object',
        },
        {
          id: '4f1bde14-7446-41ea-9702-f31bfefc66fe',
          name: 'data',
          description: 'Selected form values',
          type: 'object',
        },
      ],
    })
    .toJson();
