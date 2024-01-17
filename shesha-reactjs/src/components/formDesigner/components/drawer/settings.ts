import { nanoid } from 'nanoid/non-secure';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const getSettings = (data: { readOnly?: boolean }) =>
  new DesignerToolbarSettings(data)
    .addCollapsiblePanel({
      id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlDisplay',
      parentId: 'root',
      label: 'Display',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
        components: [
          ...new DesignerToolbarSettings()
            .addTextField({
              id: nanoid(),
              propertyName: 'componentName',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              label: 'Component name',
              validate: { required: true },
              jsSetting: false,
            })
            .addDropdown({
              id: nanoid(),
              propertyName: 'placement',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              hidden: false,
              label: 'Placement',
              useRawValues: false,
              dataSourceType: 'values',
              jsSetting: false,
              values: [
                { id: nanoid(), label: 'top', value: 'top' },
                { id: nanoid(), label: 'right', value: 'right' },
                { id: nanoid(), label: 'bottom', value: 'bottom' },
                { id: nanoid(), label: 'left', value: 'left' },
              ],
              validate: { required: true },
            })
            .addTextField({
              id: nanoid(),
              propertyName: 'width',
              label: 'Width',
              description: 'Width of the Drawer dialog in % or px',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              placeholder: '70% or 800px',
              hidden: {
                _code:
                  'return  getSettingValue(data?.placement) !== "right" && getSettingValue(data?.placement) !== "left";',
                _mode: 'code',
                _value: false,
              } as any,
            })
            .addTextField({
              id: nanoid(),
              propertyName: 'height',
              label: 'Height',
              parentId: 'pnl54bf6-f76d-4139-a850-c99bf06c8b69',
              description: 'Placement is top or bottom, height of the Drawer dialog',
              hidden: {
                _code:
                  'return  getSettingValue(data?.placement) !== "bottom" && getSettingValue(data?.placement) !== "top";',
                _mode: 'code',
                _value: false,
              } as any,
              placeholder: '70% or 800px',
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: '22224bf6-f76d-4139-a850-c99bf06c8b69',
      propertyName: 'pnlFooter',
      parentId: 'root',
      label: 'Footer',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
        components: [
          ...new DesignerToolbarSettings()
            .addCheckbox({
              id: nanoid(),
              propertyName: 'showFooter',
              label: 'Show Footer',
              description: 'Whether Ok and Cancel buttons are shown',
              parentId: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
              jsSetting: false,
            })
            .addContainer({
              id: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
              propertyName: 'containerComponents',
              direction: 'vertical',
              hidden: { _code: 'return  !getSettingValue(data?.showFooter);', _mode: 'code', _value: false } as any,
              parentId: 'pnl24bf6-f76d-4139-a850-c99bf06c8b69',
              components: new DesignerToolbarSettings()
                .addSectionSeparator({ id: nanoid(), propertyName: 'okButtonSeparator', label: 'Ok button' })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onOkAction',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                  label: 'Ok Action',
                })
                .addTextField({
                  id: nanoid(),
                  propertyName: 'okText',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                  label: 'Ok Text',
                  description: 'The text that will be displayed on the Ok button',
                })
                .addCodeEditor({
                  id: nanoid(),
                  propertyName: 'okButtonCustomEnabled',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                  label: 'Custom Enabled',
                  description: 'Enter custom enabled of the Ok button',
                  exposedVariables: [
                    {
                      id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                      name: 'data',
                      description: 'Form data',
                      type: 'object',
                    },
                    {
                      id: '65b71112-d412-401f-af15-1d3080f85319',
                      name: 'globalState',
                      description: 'The global state',
                      type: 'object',
                    },
                  ],
                })

                .addSectionSeparator({
                  id: nanoid(),
                  propertyName: 'cancelButtonSeparator',
                  label: 'Cancel button',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                })
                .addConfigurableActionConfigurator({
                  id: nanoid(),
                  propertyName: 'onCancelAction',
                  label: 'Ok Cancel',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                })
                .addTextField({
                  id: nanoid(),
                  propertyName: 'cancelText',
                  label: 'Cancel Text',
                  description: 'The text that will be displayed on the Cancel button',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                })
                .addCodeEditor({
                  id: nanoid(),
                  propertyName: 'cancelButtonCustomEnabled',
                  parentId: 'ccc24bf6-f76d-4139-a850-c99bf06c8b69',
                  label: 'Custom Enabled',
                  description: 'Enter custom enabled of the Cancel button',
                  exposedVariables: [
                    {
                      id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                      name: 'data',
                      description: 'Form data',
                      type: 'object',
                    },
                    {
                      id: '65b71112-d412-401f-af15-1d3080f85319',
                      name: 'globalState',
                      description: 'The global state',
                      type: 'object',
                    },
                  ],
                })
                .toJson(),
            })
            .toJson(),
        ],
      },
    })
    .addCollapsiblePanel({
      id: 'ecd2c3f2-3fe7-459c-8d5e-1e5b89755151',
      propertyName: 'pnlStyle',
      parentId: 'root',
      label: 'Style',
      labelAlign: 'left',
      expandIconPosition: 'start',
      ghost: true,
      collapsible: 'header',
      content: {
        id: '1452191c-1b5c-4039-b137-f6b472cc9e89',
        components: [
          ...new DesignerToolbarSettings()
            .addCodeEditor({
              id: nanoid(),
              propertyName: 'style',
              parentId: '1452191c-1b5c-4039-b137-f6b472cc9e89',
              label: 'Style',
              description:
                'A script that returns the style of the element as an object. This should conform to CSSProperties',
              exposedVariables: [
                {
                  id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                  name: 'data',
                  description: 'Form data',
                  type: 'object',
                },
                {
                  id: '65b71112-d412-401f-af15-1d3080f85319',
                  name: 'globalState',
                  description: 'The global state',
                  type: 'object',
                },
              ],
            })
            .addStyleBox({
              id: 'f8a00759-406b-4568-b65c-2eee6aeb3448',
              propertyName: 'stylingBox',
              parentId: 'root',
              validate: {},
              settingsValidationErrors: [],
            })
            .toJson(),
        ],
      },
    })
    .toJson();
