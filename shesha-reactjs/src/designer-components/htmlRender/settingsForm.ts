import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: any) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
        components: [
          ...new DesignerToolbarSettings()
            .addContextPropertyAutocomplete({
              id: nanoid(),
              propertyName: 'propertyName',
              parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
              label: 'Property name',
              validate: {
                required: true,
              },
            })
            .addCodeEditor({
              id: nanoid(),
              propertyName: 'renderer',
              parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
              label: 'Render HTML',
              description: 'Enter custom JSX script that will render a component',
              exposedVariables: [
                {
                  id: nanoid(),
                  name: 'data',
                  description: 'Form data',
                  type: 'object',
                },
                {
                  id: nanoid(),
                  name: 'globalState',
                  description: 'The global state',
                  type: 'object',
                },
              ],
              wrapInTemplate: true,
              templateSettings: {
                "functionName": "renderer"
              },
              availableConstantsExpression: '    const { modelType } = data ?? {};\r\n    const mb = metadataBuilder;\r\n    if (modelType){\r\n        await mb.addEntityAsync(\"data\", \"Form data\", modelType);\r\n' +
                '        await mb.addEntityAsync(\"initialValues\", \"Initial values\", modelType);\r\n    } else {\r\n        mb.addObject(\"data\", \"Form data\");\r\n        mb.addObject(\"initialValues\", \"Initial values\");    \r\n    };\r\n'+
                '    mb.addObject(\"parentFormValues\", \"Parent form values. The values of the form rendering the dialog.\");\r\n    \r\n    mb.addStandard([\r\n        \"shesha:form\",\r\n        \"shesha:globalState\", \r\n' +
                '        \"shesha:setGlobalState\",\r\n        \"shesha:http\",\r\n        \"shesha:message\",\r\n        \"shesha:formContext\", \r\n        \"shesha:contexts\", \r\n        \"shesha:moment\", \r\n    ]);\r\n    return mb.build();'
            })
            .addCheckbox({
              id: nanoid(),
              propertyName: 'hidden',
              parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
              label: 'Hidden',
            })
            .toJson(),
        ],
      },
    })
    .toJson();
