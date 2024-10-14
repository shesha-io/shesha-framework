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
              availableConstantsExpression: async ({ metadataBuilder, data }) => {
                const { modelType } = data ?? {};
                const result = metadataBuilder.object("constants");
                if (modelType) {
                  await result.addEntityAsync("data", "Form data", modelType);
                  await result.addEntityAsync("initialValues", "Initial values", modelType);
                } else {
                  result.addObject("data", "Form data");
                  result.addObject("initialValues", "Initial values");
                };

                result.addObject("parentFormValues", "Parent form values. The values of the form rendering the dialog.");

                result.addStandard([
                  "shesha:form",
                  "shesha:globalState",
                  "shesha:setGlobalState",
                  "shesha:http",
                  "shesha:message",
                  "shesha:pageContext",
                  "shesha:contexts",
                  "shesha:moment",
                ]);
                return result.build();
              },
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
          }).toJson()
        ]
      }
    })
    .toJson();
