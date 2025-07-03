import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const optionsCollapsiblePanelId = nanoid();
  const toolbarCollapsiblePanelId = nanoid();
  const displayCollapsiblePanelId = nanoid();
  const advancedCollapsiblePanelId = nanoid();

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
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textArea',
                  propertyName: 'description',
                  label: 'Tooltip',
                  parentId: commonTabId,
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
                      defaultValue: 'inherited'
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
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                // Toolbar section
                .addCollapsiblePanel({
                  id: toolbarCollapsiblePanelId,
                  propertyName: 'toolbarPanel',
                  label: 'Toolbar',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: toolbarCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'toolbar',
                              label: 'Show Toolbar',
                              jsSetting: true,
                            },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'toolbarButtonSize',
                          label: 'Size Of Icons',
                          parentId: toolbarCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Tiny', value: 'tiny' },
                            { label: 'Extra small', value: 'xsmall' },
                            { label: 'Middle', value: 'middle' },
                            { label: 'Large', value: 'large' },
                          ],
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'disablePlugins',
                          label: 'Hidden Actions',
                          parentId: toolbarCollapsiblePanelId,
                          jsSetting: true,
                          dropdownMode: 'multiple',
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
                // Options section
                .addCollapsiblePanel({
                  id: optionsCollapsiblePanelId,
                  propertyName: 'optionsPanel',
                  label: 'Options',
                  labelAlign: 'right',
                  parentId: dataTabId,
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
                              propertyName: 'autofocus',
                              label: 'Auto Focus',
                              tooltip: "If yes, will automatically be focused (be selected component) when the page loads",
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: optionsCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'dropdown',
                              id: nanoid(),
                              propertyName: 'preset',
                              label: 'Presets',
                              tooltip: "Choose a pre-configured toolbar layout",
                              dropdownOptions: [
                                { label: 'None', value: 'null' },
                                { label: 'Inline', value: 'inline' },
                              ],
                            }
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                // Display section
                .addCollapsiblePanel({
                  id: displayCollapsiblePanelId,
                  propertyName: 'displayPanel',
                  label: 'Display',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'direction',
                          label: 'Direction',
                          parentId: displayCollapsiblePanelId,
                          jsSetting: true,
                          dropdownOptions: [
                            { label: 'Auto', value: '' },
                            { label: 'rtl', value: 'rtl' },
                            { label: 'ltr', value: 'ltr' },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: displayCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'showCharsCounter',
                              label: 'Show Characters Counter',
                              jsSetting: true,
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'showWordsCounter',
                              label: 'Show Words Counter',
                              jsSetting: true,
                            },
                          ],
                        })
                        .toJson(),
                    ],
                  },
                })
                // Advanced section
                .addCollapsiblePanel({
                  id: advancedCollapsiblePanelId,
                  propertyName: 'advancedPanel',
                  label: 'Advanced',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...new DesignerToolbarSettings()
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: 'enter',
                          label: 'Element That Will Be Created On Enter',
                          parentId: advancedCollapsiblePanelId,
                          dropdownOptions: [
                            { label: 'Break (BR)', value: 'BR' },
                            { label: 'Paragraph (P)', value: 'P' },
                            { label: 'Block (DIV)', value: 'DIV' },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: advancedCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'insertImageAsBase64URI',
                              label: 'Insert Image As Base64 URI',
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'iframe',
                              label: 'Iframe Mode',
                              tooltip: "Isolates the editor content in a separate iframe for better style separation",
                            }
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: advancedCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'saveHeightInStorage',
                              label: 'Remember Height',
                              tooltip: "Remembers the editor height for the next session",
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'saveModeInStorage',
                              label: 'Remember Mode',
                              tooltip: "Remembers the editor mode (WYSIWYG/Source) for the next session",
                            },
                          ],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: advancedCollapsiblePanelId,
                          inputs: [
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'askBeforePasteHTML',
                              label: 'Ask Before Paste HTML',
                              tooltip: "If yes, will ask the user to confirm before allowing content copied from a Web page to be pasted in",
                            },
                            {
                              type: 'switch',
                              id: nanoid(),
                              propertyName: 'askBeforePasteFromWord',
                              label: 'Ask Before Paste From Word/Excel',
                              tooltip: "If yes, will ask the user to confirm before allowing content from Excel or Word to be pasted in",
                            },
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
                                    propertyName: 'autoWidth',
                                    label: 'Auto Width',
                                    jsSetting: true,
                                  },
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'autoHeight',
                                    label: 'Auto Height',
                                    jsSetting: true,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'dimensionsStylePnl',
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
                                parentId: 'dimensionsStylePnl',
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
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowResize',
                                parentId: 'dimensionsStylePnl',
                                inputs: [
                                  {
                                    type: 'switch',
                                    id: nanoid(),
                                    propertyName: 'allowResizeX',
                                    label: 'Allow Width Resize',
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
                                    jsSetting: true,
                                    hidden: {
                                      _code:
                                        'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.autoHeight);',
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
                  jsSetting: true,
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