import { DesignerToolbarSettings } from 'interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      name: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addTextField({
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
    })
    .addTextArea({
      id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
      name: 'description',
      parentId: 'root',
      label: 'Description',
    })
    .addSectionSeparator({
      id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
      name: 'sectionStyle',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: 'f2504ccf-6c03-4ba4-8f89-776ec2f57b3e',
      name: 'containerStyle',
      label: 'Container Style',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
    })
    .addCodeEditor({
      id: '77af6050-c35a-470b-9924-b63d6bf355b6',
      name: 'titleStyle',
      label: 'Title Style',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
    })
    .addSectionSeparator({
      id: '6e5da414-c29f-4e9a-a019-278bbd21ead4',
      name: 'sectionVisibility',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: '8c5fc51f-a459-4e2f-9ca0-2a66725c9879',
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
        { name: 'value', description: 'Component current value', type: 'string | any' },
        { name: 'data', description: 'Selected form values', type: 'object' },
      ],
    })
    .toJson();
