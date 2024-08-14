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
        id: '85323edf-da64-44ee-bb3f-f69f59abde03',
        components: [
          ...new DesignerToolbarSettings()
            .addPropertyAutocomplete({
              id: nanoid(),
              propertyName: 'componentName',
              parentId: '85323edf-da64-44ee-bb3f-f69f59abde03',
              label: 'Component name',
              validate: {
                required: true,
              },
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlStyle',
      parentId: 'root',
      label: 'Style',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: '3aba1229-e330-4b91-8576-4b5e6ab77305',
        components: [
          ...new DesignerToolbarSettings()
            .addTextField({
              id: nanoid(),
              propertyName: 'className',
              componentName: 'className',
              parentId: '3aba1229-e330-4b91-8576-4b5e6ab77305',
              label: 'Custom CSS Class',
              textType: 'text',
              description: 'Custom CSS Class to add to this component',
            })
            .addCodeEditor({
              id: nanoid(),
              propertyName: 'style',
              parentId: '3aba1229-e330-4b91-8576-4b5e6ab77305',
              label: 'Style',
              description:
                'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
            .addStyleBox({
              id: nanoid(),
              propertyName: 'stylingBox',
              parentId: '3aba1229-e330-4b91-8576-4b5e6ab77305',
              validate: {},
              settingsValidationErrors: [],
              jsSetting: false,
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: nanoid(),
      propertyName: 'pnlSecurity',
      parentId: 'root',
      label: 'Security',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: '27eaaa7e-10c0-4233-befe-d7734b97e252',
        components: [
          ...new DesignerToolbarSettings()
            .addPermissionAutocomplete({
              id: nanoid(),
              propertyName: 'permissions',
              label: 'Permissions',
              labelAlign: 'right',
              parentId: '27eaaa7e-10c0-4233-befe-d7734b97e252',
              hidden: false,
              validate: {},
            })
            .toJson(),
        ],
      },
    })
    .toJson();
