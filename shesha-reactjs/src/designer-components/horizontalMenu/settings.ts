import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const backgroundStylePnlId = nanoid();
  const pnlMenuStylesId = nanoid();
  const pnlContainerStylesId = nanoid();
  const pnlFontStyleId = nanoid();

  return {
    components: fbf()
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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...fbf()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: 'propertyName',
                label: 'Property Name',
                parentId: commonTabId,
                styledLabel: true,
                size: 'small',
                validate: {
                  required: true,
                },
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                    layout: 'horizontal',
                  },
                ],
              })
              .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Validation',
            id: validationTabId,
            components: [...fbf()
              .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Events',
            id: eventsTabId,
            components: [...fbf()
              .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Appearance',
            id: appearanceTabId,
            components: [...fbf()
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
                  _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: "",
                } as any,
                components: [
                  ...fbf()
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlMenuStyles',
                      label: 'Menu Styles',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: pnlMenuStylesId,
                        components: [...fbf()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: pnlMenuStylesId,
                            inputs: [
                              {
                                type: 'dropdown',
                                id: nanoid(),
                                propertyName: 'overflow',
                                label: 'Overflow',
                                size: 'small',
                                jsSetting: true,
                                dropdownOptions: [
                                  { label: 'Dropdown', value: 'dropdown' },
                                  { label: 'Menu', value: 'menu' },
                                  { label: 'Scroll', value: 'scroll' },
                                ],
                              },
                            ],
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlColors',
                            label: 'Colors',
                            labelAlign: 'right',
                            parentId: pnlMenuStylesId,
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlMenuStylesId,
                                  inputs: [
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'itemColor',
                                      label: 'Item Color',
                                      tooltip: 'Default text color for menu items',
                                      jsSetting: true,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'itemBackground',
                                      label: 'Item Background',
                                      tooltip: 'Default background color for menu items',
                                      jsSetting: true,
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlMenuStylesId,
                                  inputs: [
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'hoverItemColor',
                                      label: 'Hover Item Color',
                                      tooltip: 'Text color for menu items on hover',
                                      jsSetting: true,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'hoverItemBackground',
                                      label: 'Hover Item Background',
                                      tooltip: 'Background color for menu items on hover',
                                      jsSetting: true,
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlMenuStylesId,
                                  inputs: [
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'selectedItemColor',
                                      label: 'Selected Item Color',
                                      tooltip: 'Text color for selected menu items',
                                      jsSetting: true,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'selectedItemBackground',
                                      label: 'Selected Item Background',
                                      tooltip: 'Background color for selected menu items',
                                      jsSetting: true,
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlMenuStylesId,
                                  inputs: [
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'subItemColor',
                                      label: 'Sub Item Color',
                                      tooltip: 'Text color for submenu items in dropdowns',
                                      jsSetting: true,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      propertyName: 'subItemBackground',
                                      label: 'Sub Item Background',
                                      tooltip: 'Background color for submenu items in dropdowns',
                                      jsSetting: true,
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlFontStyle',
                            label: 'Font',
                            labelAlign: 'right',
                            parentId: pnlMenuStylesId,
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: pnlFontStyleId,
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlFontStyleId,
                                  inline: true,
                                  propertyName: 'font',
                                  inputs: [
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Family',
                                      propertyName: 'font.type',
                                      hideLabel: true,
                                      dropdownOptions: fontTypes,
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Size',
                                      propertyName: 'font.size',
                                      hideLabel: true,
                                      width: 50,
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Weight',
                                      propertyName: 'font.weight',
                                      hideLabel: true,
                                      tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                      dropdownOptions: fontWeightsOptions,
                                      width: 100,
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      label: 'Color',
                                      hideLabel: true,
                                      propertyName: 'font.color',
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Align',
                                      propertyName: 'font.align',
                                      hideLabel: true,
                                      width: 60,
                                      dropdownOptions: textAlignOptions,
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: pnlMenuStylesId,
                            inputs: [
                              {
                                type: 'numberField',
                                id: nanoid(),
                                propertyName: 'gap',
                                label: 'Gap',
                                jsSetting: true,
                                min: 1,
                                max: 100,
                              },
                            ],
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlMenuItemShadowStyle',
                            label: 'Shadow',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: pnlMenuStylesId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlMenuStylesId,
                                  inline: true,
                                  inputs: [
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Offset X',
                                      hideLabel: true,
                                      tooltip: 'Offset X',
                                      width: 80,
                                      icon: "offsetHorizontalIcon",
                                      propertyName: 'menuItemShadow.offsetX',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Offset Y',
                                      hideLabel: true,
                                      tooltip: 'Offset Y',
                                      width: 80,
                                      icon: 'offsetVerticalIcon',
                                      propertyName: 'menuItemShadow.offsetY',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Blur',
                                      hideLabel: true,
                                      tooltip: 'Blur Radius',
                                      width: 80,
                                      icon: 'blurIcon',
                                      propertyName: 'menuItemShadow.blurRadius',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Spread',
                                      hideLabel: true,
                                      tooltip: 'Spread Radius',
                                      width: 80,
                                      icon: 'spreadIcon',
                                      propertyName: 'menuItemShadow.spreadRadius',
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      label: 'Color',
                                      hideLabel: true,
                                      propertyName: 'menuItemShadow.color',
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlCustomStyle',
                            label: 'Custom Styles',
                            parentId: pnlMenuStylesId,
                            labelAlign: 'right',
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'style',
                                  label: 'Style',
                                  mode: 'dialog',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'styleOnHover',
                                  label: 'Style On Hover',
                                  mode: 'dialog',
                                  description: 'A script that returns the hover style of the element as an object. This should conform to CSSProperties',
                                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'styleOnSelected',
                                  label: 'Style On Selected',
                                  mode: 'dialog',
                                  description: 'A script that returns the selected style of the element as an object. This should conform to CSSProperties',
                                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'styleOnSubMenu',
                                  label: 'Style On Sub Menu',
                                  mode: 'dialog',
                                  description: 'A script that returns the sub menu style of the element as an object. This should conform to CSSProperties',
                                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlContainerStyles',
                      label: 'Container Styles',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: pnlContainerStylesId,
                        components: [...fbf()
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlDimensions',
                            label: 'Dimensions',
                            parentId: pnlContainerStylesId,
                            labelAlign: 'right',
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlContainerStylesId,
                                  inline: true,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Width",
                                      width: 85,
                                      propertyName: "dimensions.width",
                                      icon: "widthIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "dimensions.minWidth",
                                      icon: "minWidthIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "dimensions.maxWidth",
                                      icon: "maxWidthIcon",
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlContainerStylesId,
                                  inline: true,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Height",
                                      width: 85,
                                      propertyName: "dimensions.height",
                                      icon: "heightIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "dimensions.minHeight",
                                      icon: "minHeightIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "dimensions.maxHeight",
                                      icon: "maxHeightIcon",
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlBorderStyle',
                            label: 'Border',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: pnlContainerStylesId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addContainer({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  components: getBorderInputs(fbf),
                                })
                                .addContainer({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  components: getCornerInputs(fbf),
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlBackgroundStyle',
                            label: 'Background',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: pnlContainerStylesId,
                            collapsible: 'header',
                            content: {
                              id: backgroundStylePnlId,
                              components: [
                                ...fbf()
                                  .addSettingsInput({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    label: "Type",
                                    jsSetting: false,
                                    propertyName: "background.type",
                                    inputType: "radio",
                                    tooltip: "Select a type of background",
                                    buttonGroupOptions: backgroundTypeOptions,
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inputs: [{
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      label: "Color",
                                      propertyName: "background.color",
                                      hideLabel: true,
                                      jsSetting: false,
                                    }],
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inputs: [{
                                      type: 'multiColorPicker',
                                      id: nanoid(),
                                      propertyName: "background.gradient.colors",
                                      label: "Colors",
                                      jsSetting: false,
                                    }],
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                    hideLabel: true,
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inputs: [{
                                      type: 'textField',
                                      id: nanoid(),
                                      propertyName: "background.url",
                                      jsSetting: false,
                                      label: "URL",
                                    }],
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inputs: [{
                                      type: 'imageUploader',
                                      id: nanoid(),
                                      propertyName: 'background.uploadFile',
                                      label: "Image",
                                      jsSetting: false,
                                    }],
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                      {
                                        type: 'textField',
                                        id: nanoid(),
                                        jsSetting: false,
                                        propertyName: "background.storedFile.id",
                                        label: "File ID",
                                      },
                                    ],
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inline: true,
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                      {
                                        type: 'customDropdown',
                                        id: nanoid(),
                                        label: "Size",
                                        hideLabel: true,
                                        propertyName: "background.size",
                                        customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                        dropdownOptions: sizeOptions,
                                        hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                      },
                                      {
                                        type: 'customDropdown',
                                        id: nanoid(),
                                        label: "Position",
                                        hideLabel: true,
                                        customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                        propertyName: "background.position",
                                        dropdownOptions: positionOptions,
                                      },
                                    ],
                                  })
                                  .addSettingsInputRow({
                                    id: nanoid(),
                                    parentId: backgroundStylePnlId,
                                    inputs: [{
                                      type: 'radio',
                                      id: nanoid(),
                                      label: 'Repeat',
                                      hideLabel: true,
                                      propertyName: 'background.repeat',
                                      buttonGroupOptions: repeatOptions,
                                    }],
                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                  })
                                  .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlShadowStyle',
                            label: 'Shadow',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: pnlContainerStylesId,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inline: true,
                                  inputs: [
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Offset X',
                                      hideLabel: true,
                                      tooltip: 'Offset X',
                                      width: 80,
                                      icon: "offsetHorizontalIcon",
                                      propertyName: 'shadow.offsetX',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Offset Y',
                                      hideLabel: true,
                                      tooltip: 'Offset Y',
                                      width: 80,
                                      icon: 'offsetVerticalIcon',
                                      propertyName: 'shadow.offsetY',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Blur',
                                      hideLabel: true,
                                      tooltip: 'Blur Radius',
                                      width: 80,
                                      icon: 'blurIcon',
                                      propertyName: 'shadow.blurRadius',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Spread',
                                      hideLabel: true,
                                      tooltip: 'Spread Radius',
                                      width: 80,
                                      icon: 'spreadIcon',
                                      propertyName: 'shadow.spreadRadius',
                                    },
                                    {
                                      type: 'colorPicker',
                                      id: nanoid(),
                                      label: 'Color',
                                      hideLabel: true,
                                      propertyName: 'shadow.color',
                                    },
                                  ],
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'stylingBox',
                            label: 'Margin & Padding',
                            labelAlign: 'right',
                            parentId: pnlContainerStylesId,
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addStyleBox({
                                  id: nanoid(),
                                  label: 'Margin Padding',
                                  hideLabel: true,
                                  propertyName: 'stylingBox',
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlContainerCustomStyle',
                            label: 'Custom Styles',
                            parentId: pnlContainerStylesId,
                            labelAlign: 'right',
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: nanoid(),
                              components: [...fbf()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'containerStyle',
                                  label: 'Style',
                                  mode: 'dialog',
                                  description: 'A script that returns the style of the container element as an object. This should conform to CSSProperties',
                                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .toJson(),
                              ],
                            },
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .toJson(),
                ],
              }).toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [...fbf()
              .toJson(),
            ],
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
