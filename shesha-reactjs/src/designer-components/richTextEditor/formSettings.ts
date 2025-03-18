import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  // Generate IDs for tabs and panels
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const stateTabId = nanoid();
  const optionsTabId = nanoid();
  const sizesTabId = nanoid();
  const pluginsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  required: true
                },
                styledLabel: true,
                jsSetting: true,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'label',
                    label: 'Label',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hideLabel',
                    label: 'Hide Label',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hidden',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'editModeSelector',
                propertyName: 'editMode',
                label: 'Edit Mode',
                parentId: commonTabId,
                jsSetting: true,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'textField',
                propertyName: 'placeholder',
                label: 'Placeholder',
                parentId: commonTabId,
                jsSetting: true,
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },{
            key: 'state',
            title: 'State',
            id: stateTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: stateTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'saveHeightInStorage',
                    label: 'Save height in storage',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'saveModeInStorage',
                    label: 'Save mode in storage',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: stateTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'askBeforePasteHTML',
                    label: 'Ask before paste HTML',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'askBeforePasteFromWord',
                    label: 'Ask before paste from Word/Excel',
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'defaultActionOnPaste',
                label: 'Default insert method',
                parentId: stateTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'Insert as HTML', value: 'insert_as_html' },
                  { label: 'Insert cleared HTML', value: 'insert_clear_html' },
                  { label: 'Insert as plain text', value: 'insert_as_text' },
                  { label: 'Insert only text', value: 'Insert only text' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'options',
            title: 'Options',
            id: optionsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'toolbar',
                    label: 'Show toolbar?',
                    defaultValue: true,
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'textIcons',
                    label: 'Text icons?',
                    defaultValue: false,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'preset',
                label: 'Presets',
                parentId: optionsTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'None', value: 'null' },
                  { label: 'Inline Mode', value: 'inline' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'toolbarButtonSize',
                label: 'Size of icons',
                parentId: optionsTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'Tiny', value: 'tiny' },
                  { label: 'Extra small', value: 'xsmall' },
                  { label: 'Middle', value: 'middle' },
                  { label: 'Large', value: 'large' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'toolbarSticky',
                    label: 'Sticky Toolbar?',
                    defaultValue: false,
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'toolbarStickyOffset',
                    label: 'Sticky offset',
                    min: 0,
                    jsSetting: true,
                    hidden: { _code: 'return !getSettingValue(data?.toolbarSticky);', _mode: 'code', _value: false } as any,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'autofocus',
                    label: 'Auto-focus',
                    defaultValue: false,
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'useSearch',
                    label: 'Use search',
                    defaultValue: true,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'iframe',
                    label: 'Iframe mode',
                    defaultValue: false,
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'spellcheck',
                    label: 'Spell-check',
                    defaultValue: false,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'direction',
                label: 'Direction',
                parentId: optionsTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'Auto', value: '' },
                  { label: 'rtl', value: 'rtl' },
                  { label: 'ltr', value: 'ltr' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'enter',
                label: 'Element that will be created on Enter',
                parentId: optionsTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'Break (BR)', value: 'BR' },
                  { label: 'Paragraph (P)', value: 'P' },
                  { label: 'Block (DIV)', value: 'DIV' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'defaultMode',
                label: 'Default mode',
                parentId: optionsTabId,
                jsSetting: true,
                dropdownOptions: [
                  { label: 'WYSIWYG', value: '1' },
                  { label: 'Source code', value: '2' },
                  { label: 'Split code', value: '3' }
                ],
                defaultValue: ['1'],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'showCharsCounter',
                    label: 'Show characters counter',
                    defaultValue: true,
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'showWordsCounter',
                    label: 'Show words counter',
                    defaultValue: true,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: optionsTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'showXPathInStatusbar',
                    label: 'Show path to selected element',
                    defaultValue: true,
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'insertImageAsBase64URI',
                    label: 'Insert image as Base64 URI',
                    defaultValue: false,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'sizes',
            title: 'Sizes',
            id: sizesTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'autoHeight',
                    label: 'Auto height',
                    defaultValue: true,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'allowResizeY',
                    label: 'Allow Height resize',
                    defaultValue: true,
                    jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.autoHeight);', _mode: 'code', _value: false } as any,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'height',
                    label: 'Height(px)',
                    min: 0,
                    jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.autoHeight);', _mode: 'code', _value: false } as any,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'minHeight',
                    label: 'Min height(px)',
                    min: 0,
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'maxHeight',
                    label: 'Max height(px)',
                    min: 0,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'autoWidth',
                    label: 'Auto width',
                    defaultValue: true,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'allowResizeX',
                    label: 'Allow Width resize',
                    defaultValue: true,
                    jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.autoWidth);', _mode: 'code', _value: false } as any,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'width',
                    label: 'Width(px)',
                    min: 0,
                    jsSetting: true,
                    hidden: { _code: 'return getSettingValue(data?.autoWidth);', _mode: 'code', _value: false } as any,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: sizesTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'minWidth',
                    label: 'Min width(px)',
                    min: 0,
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'maxWidth',
                    label: 'Max width(px)',
                    min: 0,
                    jsSetting: true,
                  }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'plugins',
            title: 'Plugins',
            id: pluginsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'disablePlugins',
                label: 'Disabled plugins',
                parentId: pluginsTabId,
                jsSetting: true,
                mode: 'multiple',
                //allowSearch: true,
                dropdownOptions: [
                  { label: 'add-new-line', value: 'add-new-line' },
                  { label: 'about', value: 'about' },
                  { label: 'focus', value: 'focus' },
                  { label: 'class-span', value: 'class-span' },
                  { label: 'backspace', value: 'backspace' },
                  { label: 'bold', value: 'bold' },
                  { label: 'wrap-nodes', value: 'wrap-nodes' },
                  { label: 'clean-html', value: 'clean-html' },
                  { label: 'copy-format', value: 'copy-format' },
                  { label: 'clipboard', value: 'clipboard' },
                  { label: 'paste', value: 'paste' },
                  { label: 'paste-storage', value: 'paste-storage' },
                  { label: 'drag-and-drop', value: 'drag-and-drop' },
                  { label: 'drag-and-drop-element', value: 'drag-and-drop-element' },
                  { label: 'paste-from-word', value: 'paste-from-word' },
                  { label: 'color', value: 'color' },
                  { label: 'enter', value: 'enter' },
                  { label: 'key-arrow-outside', value: 'key-arrow-outside' },
                  { label: 'error-messages', value: 'error-messages' },
                  { label: 'font', value: 'font' },
                  { label: 'format-block', value: 'format-block' },
                  { label: 'fullsize', value: 'fullsize' },
                  { label: 'hotkeys', value: 'hotkeys' },
                  { label: 'iframe', value: 'iframe' },
                  { label: 'indent', value: 'indent' },
                  { label: 'hr', value: 'hr' },
                  { label: 'inline-popup', value: 'inline-popup' },
                  { label: 'justify', value: 'justify' },
                  { label: 'line-height', value: 'line-height' },
                  { label: 'limit', value: 'limit' },
                  { label: 'link', value: 'link' },
                  { label: 'mobile', value: 'mobile' },
                  { label: 'ordered-list', value: 'ordered-list' },
                  { label: 'powered-by-jodit', value: 'powered-by-jodit' },
                  { label: 'placeholder', value: 'placeholder' },
                  { label: 'redo-undo', value: 'redo-undo' },
                  { label: 'resizer', value: 'resizer' },
                  { label: 'search', value: 'search' },
                  { label: 'select', value: 'select' },
                  { label: 'size', value: 'size' },
                  { label: 'resize-handler', value: 'resize-handler' },
                  { label: 'source', value: 'source' },
                  { label: 'stat', value: 'stat' },
                  { label: 'sticky', value: 'sticky' },
                  { label: 'spellcheck', value: 'spellcheck' },
                  { label: 'symbols', value: 'symbols' },
                  { label: 'tooltip', value: 'tooltip' },
                  { label: 'tab', value: 'tab' },
                  { label: 'xpath', value: 'xpath' },
                  { label: 'image-properties', value: 'image-properties' },
                  { label: 'image-processor', value: 'image-processor' },
                  { label: 'image', value: 'image' },
                  { label: 'media', value: 'media' },
                  { label: 'video', value: 'video' },
                  { label: 'file', value: 'file' },
                  { label: 'resize-cells', value: 'resize-cells' },
                  { label: 'select-cells', value: 'select-cells' },
                  { label: 'table-keyboard-navigation', value: 'table-keyboard-navigation' },
                  { label: 'table', value: 'table' },
                  { label: 'preview', value: 'preview' },
                  { label: 'print', value: 'print' }
                ],
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
              })
              .toJson()
            ]
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...new DesignerToolbarSettings()
              .addPropertyRouter({
                id: styleRouterId,
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                parentId: appearanceTabId,
                hidden: false,
                propertyRouteName: {
                  _mode: "code",
                  _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: ""
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlTheme',
                      label: 'Theme',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            label: 'Style',
                            parentId: styleRouterId,
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                            exposedVariables: [`{ "name": "data", "description": "Form values", "type": "object" }`],
                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'dropdown',
                            propertyName: 'theme',
                            label: 'Theme',
                            parentId: styleRouterId,
                            jsSetting: true,
                            dropdownOptions: [
                              { label: 'Default', value: 'default' },
                              { label: 'Dark', value: 'dark' }
                            ],
                            defaultValue: ['default'],
                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()
                ]
              })
              .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId
              })
              .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};