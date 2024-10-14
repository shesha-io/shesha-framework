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
              jsSetting: false
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
    .addPropertyRouter({
      id: nanoid(),
      propertyName: 'propertyRouter1',
      componentName: 'propertyRouter1',
      label: 'Property router1',
      labelAlign: 'right',
      parentId: 'root',
      hidden: false,
      propertyRouteName: {
        _mode: "code",
        _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
        _value: ""
      },
      components: [
        ...new DesignerToolbarSettings()
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
            .addTextField({
              id: nanoid(),
              propertyName: 'className',
              componentName: 'className',
              parentId: '92ad3873-216c-4465-a21f-489f21e9cca5',
              label: 'Custom CSS Class',
              textType: 'text',
              description: 'Custom CSS Class to add to this component',
            })
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
    }).toJson()]})
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
        id:'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
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
