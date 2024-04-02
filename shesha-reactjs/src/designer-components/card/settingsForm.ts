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
        id: '11a170e0-ff22-4448-a2f3-0030580ea52b',
        components: [
          ...new DesignerToolbarSettings()
            .addPropertyAutocomplete({
              id: nanoid(),
              propertyName: 'componentName',
              parentId: '11a170e0-ff22-4448-a2f3-0030580ea52b',
              label: 'Component name',
              validate: {
                required: true,
              },
            })
            .addTextField({
              id: nanoid(),
              propertyName: 'label',
              parentId: '11a170e0-ff22-4448-a2f3-0030580ea52b',
              label: 'Heading',
            })
            .addCheckbox({
              id: nanoid(),
              propertyName: 'hidden',
              parentId: '11a170e0-ff22-4448-a2f3-0030580ea52b',
              label: 'Hidden',
            })
            .addCheckbox({
              id: nanoid(),
              propertyName: 'hideHeading',
              parentId: '11a170e0-ff22-4448-a2f3-0030580ea52b',
              label: 'Hide Heading',
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
        id: '92ad3873-216c-4465-a21f-489f21e9cca5',
        components: [
          ...new DesignerToolbarSettings()
            .addCodeEditor({
              id: nanoid(),
              propertyName: 'style',
              parentId: '92ad3873-216c-4465-a21f-489f21e9cca5',
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
              parentId: '92ad3873-216c-4465-a21f-489f21e9cca5',
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
      propertyName: 'pnlVisibility',
      parentId: 'root',
      label: 'Visibility',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
        components: [
          ...new DesignerToolbarSettings()
            .addCheckbox({
              id: nanoid(),
              propertyName: 'hideWhenEmpty',
              parentId: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
              label: 'Hide when empty',
              labelAlign: 'right',
              hidden: false,
              isDynamic: false,
              description: 'Allows to hide the panel when all components are hidden due to some conditions',
            })
            .toJson(),
        ],
      },
    })
    .toJson();
