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
            .addPropertyAutocomplete({
              id: nanoid(),
              propertyName: 'componentName',
              parentId: '87667bd9-0ba6-4f29-a7d3-aecdac17da2a',
              label: 'Component name',
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
