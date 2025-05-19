import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
  // Generate IDs for tabs and panels
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const mainTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  // Generate IDs for collapsible panels in main tab
  const stateCollapsiblePanelId = nanoid();
  const optionsCollapsiblePanelId = nanoid();
  const pluginsCollapsiblePanelId = nanoid();

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
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  styledLabel: true,
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textField',
                  propertyName: 'placeholder',
                  label: 'Placeholder',
                  parentId: commonTabId,
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'editModeSelector',
                      id: nanoid(),
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      jsSetting: true,
                      defaultValue: 'inherited',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'main',
            title: 'Main',
            id: mainTabId,
            components: [
              ...new DesignerToolbarSettings()
                // State section in a collapsible panel
                .addCollapsiblePanel({
                  id: stateCollapsiblePanelId,
                  propertyName: 'statePanel',
                  label: 'State',
                  labelAlign: 'right',
                  parentId: mainTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: stateCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'saveHeightInStorage',
                              label: 'Save Height In Storage',
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'saveModeInStorage',
                              label: 'Save Mode In Storage',
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: stateCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'askBeforePasteHTML',
                              label: 'Ask Before Paste HTML',
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'askBeforePasteFromWord',
                              label: 'Ask Before Paste From Word/Excel',
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'defaultActionOnPaste',
                          label: 'Default Insert Method',
                          parentId: stateCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Insert as HTML', value: 'insert_as_html' },
                            { label: 'Insert cleared HTML', value: 'insert_clear_html' },
                            { label: 'Insert as plain text', value: 'insert_as_text' },
                            { label: 'Insert only text', value: 'Insert only text' },
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                // Options section in a collapsible panel
                .addCollapsiblePanel({
                  id: optionsCollapsiblePanelId,
                  propertyName: 'optionsPanel',
                  label: 'Options',
                  labelAlign: 'right',
                  parentId: mainTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'toolbar',
                              label: 'Show Toolbar',
                              defaultValue: true,
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'textIcons',
                              label: 'Text Icons',
                              defaultValue: false,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'preset',
                          label: 'Presets',
                          parentId: optionsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'None', value: 'null' },
                            { label: 'Inline Mode', value: 'inline' },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'toolbarButtonSize',
                          label: 'Size Of Icons',
                          parentId: optionsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Tiny', value: 'tiny' },
                            { label: 'Extra small', value: 'xsmall' },
                            { label: 'Middle', value: 'middle' },
                            { label: 'Large', value: 'large' },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'toolbarSticky',
                              label: 'Sticky Toolbar',
                              defaultValue: false,
                              jsSetting: true,
                            },
                            {
                              type: 'numberField',
                              id: nanoid(),
                              propertyName: 'toolbarStickyOffset',
                              label: 'Sticky Offset',
                              min: 0,
                              jsSetting: true,
                              hidden: {
                                _code: 'return !getSettingValue(data?.toolbarSticky);',
                                _mode: 'code',
                                _value: false,
                              } as any,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'autofocus',
                              label: 'Auto Focus',
                              defaultValue: false,
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'useSearch',
                              label: 'Use Search',
                              defaultValue: true,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'iframe',
                              label: 'Iframe Mode',
                              defaultValue: false,
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'spellcheck',
                              label: 'Spell Check',
                              defaultValue: false,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'direction',
                          label: 'Direction',
                          parentId: optionsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Auto', value: '' },
                            { label: 'rtl', value: 'rtl' },
                            { label: 'ltr', value: 'ltr' },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'enter',
                          label: 'Element That Will Be Created On Enter',
                          parentId: optionsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Break (BR)', value: 'BR' },
                            { label: 'Paragraph (P)', value: 'P' },
                            { label: 'Block (DIV)', value: 'DIV' },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'defaultMode',
                          label: 'Default Mode',
                          parentId: optionsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'WYSIWYG', value: '1' },
                            { label: 'Source code', value: '2' },
                            { label: 'Split code', value: '3' },
                          ],
                          defaultValue: ['1'],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'showCharsCounter',
                              label: 'Show Characters Counter',
                              defaultValue: true,
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'showWordsCounter',
                              label: 'Show Words Counter',
                              defaultValue: true,
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'showXPathInStatusbar',
                              label: 'Show Path To Selected Element',
                              defaultValue: true,
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'insertImageAsBase64URI',
                              label: 'Insert Image As Base64 URI',
                              defaultValue: false,
                              jsSetting: true,
                            },
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                // Plugins section in a collapsible panel
                .addCollapsiblePanel({
                  id: pluginsCollapsiblePanelId,
                  propertyName: 'pluginsPanel',
                  label: 'Plugins',
                  labelAlign: 'right',
                  parentId: mainTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'disablePlugins',
                          label: 'Disabled Plugins',
                          parentId: pluginsCollapsiblePanelId,
                          jsSetting: true,
                          dropdownMode: 'multiple',
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
                            { label: 'print', value: 'print' },
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: styleRouterId,
                  propertyName: 'propertyRouter1',
                  componentName: 'propertyRouter',
                  label: 'Property router1',
                  labelAlign: 'right',
                  parentId: appearanceTabId,
                  hidden: false,
                  propertyRouteName: {
                    _mode: 'code',
                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        inputType: 'dropdown',
                        propertyName: 'theme',
                        label: 'Theme',
                        parentId: styleRouterId,
                        jsSetting: true,
                        dropdownOptions: [
                          { label: 'Default', value: 'default' },
                          { label: 'Dark', value: 'dark' },
                        ],
                        defaultValue: ['default'],
                      })
                      .addCollapsiblePanel({
                        id: 'dimensionsStyleCollapsiblePanel',
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: 'dimensionsStylePnl',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'dimensionsStylePnl',
                                inputs: [
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'autoHeight',
                                    label: 'Auto Height',
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'autoWidth',
                                    label: 'Auto Width',
                                    jsSetting: true,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowWidth',
                                parentId: 'dimensionsStylePnl',
                                inputs: [
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'allowResizeX',
                                    label: 'Allow Width Resize',
                                    defaultValue: true,
                                    jsSetting: true,
                                    hidden: {
                                      _code:
                                        'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoWidth);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'allowResizeY',
                                    label: 'Allow Height Resize',
                                    defaultValue: true,
                                    jsSetting: true,
                                    hidden: {
                                      _code:
                                        'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoHeight);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  // {
                                  //   type: 'textField',
                                  //   id: nanoid(),
                                  //   label: 'Width',
                                  //   width: 85,
                                  //   propertyName: 'width',
                                  //   icon: 'widthIcon',
                                  //   tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  //   hidden: {
                                  //     _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoWidth);',
                                  //     _mode: 'code',
                                  //     _value: false,
                                  //   } as any,
                                  // },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoWidth);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'dimensions.width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minWidth',
                                    icon: 'minWidthIcon',
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.allowResizeX);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxWidth',
                                    icon: 'maxWidthIcon',
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.allowResizeX);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoHeight);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'dimensions.height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Min Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minHeight',
                                    icon: 'minHeightIcon',
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.allowResizeY);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxHeight',
                                    icon: 'maxHeightIcon',
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.allowResizeY);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'style',
                                label: 'Style',
                                parentId: styleRouterId,
                                description:
                                  'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                exposedVariables: [
                                  `{ "name": "data", "description": "Form values", "type": "object" }`,
                                ],
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityTabId,
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
