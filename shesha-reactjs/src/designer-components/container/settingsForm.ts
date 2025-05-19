import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import {
  ALIGN_ITEMS,
  ALIGN_ITEMS_GRID,
  ALIGN_SELF,
  FLEX_DIRECTION,
  FLEX_WRAP,
  JUSTIFY_CONTENT,
  JUSTIFY_ITEMS,
  JUSTIFY_SELF,
  TEXT_JUSTIFY,
} from './data';


import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { overflowOptions } from '../_settings/utils/dimensions/utils';

export const getSettings = (data) => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const displayCollapsiblePanelId = nanoid();
  const fontStylePnlId = nanoid();
  const flexGridPropertiesContainerId = nanoid();
  const buttonDisplayContainerId = nanoid();
  const nonBlockContainerId = nanoid();
  const dimensionsStyleCollapsiblePanelId = nanoid();
  const dimensionsStylePnlId = nanoid();
  const borderStyleCollapsiblePanelId = nanoid();
  const borderStylePnlId = nanoid();
  const backgroundStyleCollapsiblePanelId = nanoid();
  const backgroundStylePnlId = nanoid();
  const shadowStyleCollapsiblePanelId = nanoid();
  const shadowStylePnlId = nanoid();
  const shadowStyleRowId = nanoid();
  const styleCollapsiblePanelId = nanoid();
  const stylePnlId = nanoid();
  const styleBoxPnlId = nanoid();
  const customStyleCollapsiblePanelId = nanoid();
  const stylePnlCustomId = nanoid();

  const getDisplayType = ' getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display)';

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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                propertyName: 'propertyName',
                label: 'Component Name',
                parentId: commonTabId,
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
                    type: 'editModeSelector',
                    id: nanoid(),
                    propertyName: 'editMode',
                    label: 'Edit Mode',
                    size: 'small',
                    jsSetting: true,
                  },
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
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'noDefaultStyling',
                label: 'No Default Styling',
                parentId: commonTabId,
                size: 'small',
                jsSetting: true,
              })
              .toJson()
            ]
          },
          {
            key: '2',
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
                  _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: ""
                },
                components: [
                  ...new DesignerToolbarSettings()
                    // .addCollapsiblePanel({
                    //   id: nanoid(),
                    //   propertyName: 'pnlPosition',
                    //   label: 'Position',
                    //   labelAlign: 'right',
                    //   parentId: styleRouterId,
                    //   ghost: true,
                    //   collapsible: 'header',
                    //   content: {
                    //     id: nanoid(),
                    //     components: [...new DesignerToolbarSettings()
                    //       .addSettingsInput({
                    //         id: nanoid(),
                    //         propertyName: 'position.value',
                    //         label: 'Position',
                    //         parentId: 'positionCollapsiblePanel',
                    //         inputType: 'dropdown',
                    //         description: 'The position CSS property sets how an element is positioned in a document. The top, right, bottom, and left properties determine the final location of positioned elements.',
                    //         validate: {
                    //           required: true,
                    //         },
                    //         dropdownOptions: [
                    //           { value: 'relative', label: 'Relative' },
                    //           { value: 'absolute', label: 'Absolute' }
                    //         ]
                    //       })
                    //       .addSettingsInputRow(
                    //         getPositionInputs()[0] as any
                    //       )
                    //       .addSettingsInputRow(
                    //         getPositionInputs()[1] as any
                    //       )
                    //       .addSettingsInputRow(
                    //         getPositionInputs()[2] as any
                    //       )
                    //       .addSettingsInputRow(
                    //         getPositionInputs()[3] as any
                    //       )
                    //       .toJson()
                    //     ]
                    //   }
                    // })
                    .addCollapsiblePanel({
                      id: displayCollapsiblePanelId,
                      propertyName: 'pnlDisplayStyle',
                      label: 'Display',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: fontStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            propertyName: 'display',
                            label: 'Layout Type',
                            parentId: displayCollapsiblePanelId,
                            inputType: 'radio',
                            description: 'The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.',
                            validate: {
                              required: true,
                            },
                            buttonGroupOptions: [
                              { value: 'block', title: 'Block', icon: 'BorderOutlined' },
                              { value: 'grid', title: 'Grid', icon: 'AppstoreOutlined' },
                              { value: 'flex', title: 'Flex', icon: 'flex' },
                              { value: 'inline-grid', title: 'Inline grid', icon: 'TableOutlined' }
                            ]
                          })
                          .addContainer({
                            id: flexGridPropertiesContainerId,
                            parentId: displayCollapsiblePanelId,
                            hidden: {
                              _code: 'return' + getDisplayType + ' === "block";',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            components: [
                              ...new DesignerToolbarSettings()
                                .addContainer({
                                  id: buttonDisplayContainerId,
                                  parentId: displayCollapsiblePanelId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        inline: true,
                                        parentId: buttonDisplayContainerId,
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Flex Direction',
                                            hideLabel: true,
                                            propertyName: 'flexDirection',
                                            hidden: {
                                              _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "flex";',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                            buttonGroupOptions: [
                                              {
                                                title: 'Row',
                                                value: 'row',
                                                icon: 'row'
                                              },
                                              {
                                                title: 'Column',
                                                value: 'column',
                                                icon: 'column'
                                              }
                                            ]
                                          },
                                          {
                                            id: nanoid(),
                                            type: 'radio',
                                            label: 'Justify Content',
                                            hideLabel: true,
                                            hidden: {
                                              _code: `return (${getDisplayType} == "flex"` +
                                                ' && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.flexDirection) == "column")' +
                                                ` || ${getDisplayType} == "inline-grid"`,
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                            propertyName: 'justifyContent',
                                            buttonGroupOptions: [
                                              {
                                                title: 'Left',
                                                value: 'left',
                                                icon: 'alignHorizontalLeft'
                                              },
                                              {
                                                title: 'Center',
                                                value: 'center',
                                                icon: 'alignHorizontalCenter'
                                              },
                                              {
                                                title: 'Right',
                                                value: 'right',
                                                icon: 'alignHorizontalRight'
                                              }
                                            ]
                                          },
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Align Items',
                                            hideLabel: true,
                                            propertyName: 'alignItems',
                                            hidden: {
                                              _code: `return ${getDisplayType} == "flex"` + ' && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.flexDirection) == "column"',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                            buttonGroupOptions: [
                                              {
                                                title: 'Start',
                                                value: 'start',
                                                icon: 'alignVerticalTop'
                                              },
                                              {
                                                title: 'Center',
                                                value: 'center',
                                                icon: 'alignVerticalCenter'
                                              },
                                              {
                                                title: 'End',
                                                value: 'end',
                                                icon: 'alignVerticalBottom'
                                              }
                                            ]
                                          },
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Align Items',
                                            hideLabel: true,
                                            hidden: {
                                              _code: `return ${getDisplayType} !== "flex"` + ' || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.flexDirection) !== "column"',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                            propertyName: 'alignItems',
                                            buttonGroupOptions: [
                                              {
                                                title: 'Start',
                                                value: 'start',
                                                icon: 'alignHorizontalLeft'
                                              },
                                              {
                                                title: 'Center',
                                                value: 'center',
                                                icon: 'alignHorizontalCenter'
                                              },
                                              {
                                                title: 'End',
                                                value: 'end',
                                                icon: 'alignHorizontalRight'
                                              }
                                            ]
                                          },
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Justify Content',
                                            hideLabel: true,
                                            propertyName: 'justifyContent',
                                            hidden: {
                                              _code: `return ${getDisplayType} !== "flex"` + ' || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.flexDirection) !== "column"',
                                              _mode: 'code',
                                              _value: false,
                                            } as any,
                                            buttonGroupOptions: [
                                              {
                                                title: 'Start',
                                                value: 'start',
                                                icon: 'alignVerticalTop'
                                              },
                                              {
                                                title: 'Center',
                                                value: 'center',
                                                icon: 'alignVerticalCenter'
                                              },
                                              {
                                                title: 'End',
                                                value: 'end',
                                                icon: 'alignVerticalBottom'
                                              }
                                            ]
                                          },
                                          {
                                            type: 'button',
                                            id: nanoid(),
                                            label: 'Show Advanced',
                                            hideLabel: true,
                                            propertyName: 'showAdvanced',
                                            icon: 'tuneIcon'
                                          }
                                        ]
                                      })
                                      .toJson()
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: displayCollapsiblePanelId,
                                  inline: true,
                                  hidden: {
                                    _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "flex";',
                                    _mode: 'code',
                                    _value: false,
                                  } as any,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: 'Gap',
                                      propertyName: 'gap',
                                      description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`',
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Flex Wrap',
                                      propertyName: 'flexWrap',
                                      dropdownOptions: FLEX_WRAP
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: displayCollapsiblePanelId,
                                  hidden: {
                                    _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "grid" && getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "inline-grid";',
                                    _mode: 'code',
                                    _value: false,
                                  } as any,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: 'Gap',
                                      propertyName: 'gap',
                                      description: 'Examples of a valid gap include: `10` | `10px` | `20px 20px`',
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      propertyName: 'gridColumnsCount',
                                      parentId: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
                                      label: 'Grid Columns Count',
                                      description: 'Number of columns each grid should have',
                                    },
                                  ],
                                })
                                .toJson()
                            ]
                          })
                          .addContainer({
                            id: nonBlockContainerId,
                            parentId: displayCollapsiblePanelId,
                            hidden: {
                              _code: `return ${getDisplayType} == "block"` +
                                '|| !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.showAdvanced)',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            components: [
                              ...new DesignerToolbarSettings()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: displayCollapsiblePanelId,
                                  inline: false,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Flex Direction',
                                      propertyName: 'flexDirection',
                                      hidden: {
                                        _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "flex";',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      dropdownOptions: FLEX_DIRECTION,
                                      description: 'The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).',

                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Align Items',
                                      propertyName: 'alignItems',
                                      dropdownOptions: [...ALIGN_ITEMS, ...ALIGN_ITEMS_GRID]
                                    }
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: displayCollapsiblePanelId,
                                  inline: false,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Justify Content',
                                      propertyName: 'justifyContent',
                                      dropdownOptions: JUSTIFY_CONTENT
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Justify Self',
                                      propertyName: 'justifySelf',
                                      hidden: {
                                        _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) === "flex";',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      dropdownOptions: JUSTIFY_SELF
                                    },
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: displayCollapsiblePanelId,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Align Self',
                                      propertyName: 'alignSelf',
                                      dropdownOptions: ALIGN_SELF
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Justify Items',
                                      propertyName: 'justifyItems',
                                      hidden: {
                                        _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) === "flex";',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      dropdownOptions: JUSTIFY_ITEMS
                                    }
                                  ]
                                })
                                .toJson()
                            ]
                          })
                          .addSettingsInput(
                            {
                              inputType: 'dropdown',
                              id: nanoid(),
                              label: 'Text Justify',
                              propertyName: 'textJustify',
                              hidden: {
                                _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.display) !== "block";',
                                _mode: 'code',
                                _value: false,
                              } as any,
                              dropdownOptions: TEXT_JUSTIFY
                            }
                          )
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: displayCollapsiblePanelId,
                            inline: false,
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            inputs: [
                              {
                                type: 'dropdown',
                                id: nanoid(),
                                label: 'Overflow',
                                propertyName: 'overflow',
                                dropdownOptions: overflowOptions
                              },
                              {
                                id: nanoid(),
                                type: 'switch',
                                label: "Hide Scroll Bar",
                                propertyName: 'hideScrollBar'
                              }
                            ],
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: dimensionsStyleCollapsiblePanelId,
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: styleRouterId,
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: dimensionsStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: dimensionsStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Width",
                                width: 85,
                                propertyName: "dimensions.width",
                                icon: "widthIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

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
                              }
                            ]
                          })
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: dimensionsStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: nanoid(),
                                label: "Height",
                                width: 85,
                                propertyName: "dimensions.height",
                                icon: "heightIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
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
                              }
                            ]
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: borderStyleCollapsiblePanelId,
                      propertyName: 'pnlBorderStyle',
                      label: 'Border',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: borderStylePnlId,
                        components: [...new DesignerToolbarSettings()

                          .addContainer({
                            id: nanoid(),
                            parentId: borderStylePnlId,
                            components: getBorderInputs() as any
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: borderStylePnlId,
                            components: getCornerInputs() as any
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: backgroundStyleCollapsiblePanelId,
                      propertyName: 'pnlBackgroundStyle',
                      label: 'Background',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: backgroundStylePnlId,
                        components: [
                          ...new DesignerToolbarSettings()
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
                              }
                              ],
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
                                  label: "File ID"
                                }
                              ]
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
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  dropdownOptions: sizeOptions,
                                },
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Position",
                                  hideLabel: true,
                                  customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                  propertyName: "background.position",
                                  dropdownOptions: positionOptions,
                                }
                              ]
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
                                inputType: 'radio',
                                buttonGroupOptions: repeatOptions,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                        ],
                      }
                    })
                    .addCollapsiblePanel({
                      id: shadowStyleCollapsiblePanelId,
                      propertyName: 'pnlShadowStyle',
                      label: 'Shadow',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: shadowStylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: shadowStyleRowId,
                            parentId: shadowStylePnlId,
                            inline: true,
                            inputs: [
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset X',
                                hideLabel: true,
                                width: 80,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Offset Y',
                                hideLabel: true,
                                width: 80,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Blur',
                                hideLabel: true,
                                width: 80,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: nanoid(),
                                label: 'Spread',
                                hideLabel: true,
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
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: styleCollapsiblePanelId,
                      propertyName: 'stylingBox',
                      label: 'Margin & Padding',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      content: {
                        id: stylePnlId,
                        components: [...new DesignerToolbarSettings()
                          .addStyleBox({
                            id: styleBoxPnlId,
                            label: 'Margin Padding',
                            hideLabel: true,
                            propertyName: 'stylingBox',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: customStyleCollapsiblePanelId,
                      propertyName: 'customStyle',
                      label: 'Custom Styles',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: stylePnlCustomId,
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'textField',
                            propertyName: 'className',
                            label: 'Custom CSS Class',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'wrapperStyle',
                            label: 'Wrapper Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()]
              }).toJson()]
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId,
              })
              .toJson()
            ]
          }
        ]
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};