import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addSectionSeparator({
      id: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'separator1',
      parentId: 'root',
      label: 'Display',
    })
    .addTextField({
      id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
      propertyName: 'componentName',
      parentId: 'root',
      label: 'Component name',
      validate: {
        required: true,
      },
    })
    .addTextField({
      id: '46d07439-4c18-468c-89e1-60c002ce96c5',
      propertyName: 'label',
      parentId: 'root',
      label: 'Label',
    })
    .addTextArea({
      id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
      propertyName: 'description',
      parentId: 'root',
      label: 'Description',
    })
    .addCheckbox({
      id: '12345e70-99a0-4825-ae6c-8b933004e119',
      propertyName: 'hidden',
      parentId: 'root',
      label: 'Hidden',
    })
    .addSectionSeparator({
      id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
      propertyName: 'sectionStyle',
      parentId: 'root',
      label: 'Style',
    })
    .addCodeEditor({
      id: 'f2504ccf-6c03-4ba4-8f89-776ec2f57b3e',
      propertyName: 'containerStyle',
      label: 'Container Style',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
    })
    .addStyleBox({
      id: 'a0e21b98-0cb9-45ef-8b79-c78c884534f4',
      propertyName: 'stylingBox',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
    })
    .addCodeEditor({
      id: '77af6050-c35a-470b-9924-b63d6bf355b6',
      propertyName: 'titleStyle',
      label: 'Title Style',
      parentId: 'root',
      validate: {},
      settingsValidationErrors: [],
      description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
      exposedVariables: [{ name: 'data', description: 'Form values', type: 'object' }],
    })
    .toJson();
