import { IKanbanProps } from '@/components/kanban/model';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { repeatOptions } from '../_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';

export const getSettings = (data: IKanbanProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const columnsTabId = nanoid();
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
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'componentName',
                  label: 'Component Name',
                  parentId: commonTabId,
                  validate: {
                    required: true,
                  },
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'formAutocomplete',
                      id: nanoid(),
                      propertyName: 'modalFormId',
                      label: 'Render Form',
                      jsSetting: true,
                      validate: {
                        required: true,
                      },
                    },
                    {
                      type: 'propertyAutocomplete',
                      id: nanoid(),
                      propertyName: 'groupingProperty',
                      label: 'Grouping Property',
                      jsSetting: true,
                      validate: {
                        required: true,
                      },
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'collapsible',
                      label: 'Collapsible',
                      jsSetting: true,
                      hidden: {
                        _code: 'return getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'kanbanReadonly',
                      label: 'Readonly',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'allowDelete',
                      label: 'Allow Delete',
                      jsSetting: true,
                      hidden: {
                        _code: 'return getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showIcons',
                      label: 'Show Icons',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'allowNewRecord',
                      label: 'Allow New Record',
                      jsSetting: true,
                      hidden: {
                        _code: 'return getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      type: 'formAutocomplete',
                      id: nanoid(),
                      propertyName: 'createFormId',
                      label: 'Create Form',
                      jsSetting: true,
                      hidden: {
                        _code:
                          'return !getSettingValue(data?.allowNewRecord) || getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      validate: {
                        required: true,
                      },
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'allowEdit',
                      label: 'Allow Edit',
                      jsSetting: true,
                      hidden: {
                        _code: 'return getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      type: 'formAutocomplete',
                      id: nanoid(),
                      propertyName: 'editFormId',
                      label: 'Edit Form',
                      jsSetting: true,
                      hidden: {
                        _code: 'return !getSettingValue(data?.allowEdit) || getSettingValue(data?.kanbanReadonly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      validate: {
                        required: true,
                      },
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'columns',
            title: 'Data',
            id: columnsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: columnsTabId,
                  inputs: [
                    {
                      type: 'autocomplete',
                      id: nanoid(),
                      propertyName: 'referenceList',
                      label: 'Reference List',
                      tooltip: 'Make sure to reselect the reference list if any changes are made to its items',
                      dataSourceType: 'entitiesList',
                      entityType: 'Shesha.Framework.ReferenceList',
                      filter: { and: [{ '==': [{ var: 'isLast' }, true] }] },
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'items',
                  label: 'Items',
                  labelAlign: 'right',
                  parentId: columnsTabId,
                  referenceList: {
                    _code: 'return getSettingValue(data?.referenceList);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputType: 'RefListItemSelectorSettingsModal',
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
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'headerStyles',
                        label: 'Header Styles',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: 'fontStyleCollapsiblePanel',
                                propertyName: 'pnlFontStyle',
                                label: 'Font',
                                labelAlign: 'right',
                                parentId: 'styleRouter',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                  id: 'fontStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'try26voxhs-HxJ5k5ngYE',
                                        parentId: 'fontStylePnl',
                                        inline: true,
                                        propertyName: 'font',
                                        inputs: [
                                          {
                                            type: 'dropdown',
                                            id: 'fontFamily-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Family',
                                            propertyName: 'font.type',
                                            hideLabel: true,
                                            dropdownOptions: fontTypes,
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Size',
                                            propertyName: 'font.size',
                                            hideLabel: true,
                                            width: 50,
                                          },
                                          {
                                            type: 'dropdown',
                                            id: 'fontWeight-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Weight',
                                            propertyName: 'font.weight',
                                            hideLabel: true,
                                            tooltip: 'Controls text thickness (light, normal, bold, etc.)',
                                            dropdownOptions: fontWeights,
                                            width: 100,
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'font.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'backgroundStyleCollapsiblePanels',
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'backgroundStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'backgroundStyleRow-selectTypes',
                                        parentId: 'backgroundStylePnl',
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'background.type',
                                        inputType: 'radio',
                                        tooltip: 'Select a type of background',
                                        buttonGroupOptions: [
                                          {
                                            value: 'color',
                                            icon: 'FormatPainterOutlined',
                                            title: 'Color',
                                          },
                                          {
                                            value: 'gradient',
                                            icon: 'BgColorsOutlined',
                                            title: 'Gradient',
                                          },
                                          {
                                            value: 'image',
                                            icon: 'PictureOutlined',
                                            title: 'Image',
                                          },
                                          {
                                            value: 'url',
                                            icon: 'LinkOutlined',
                                            title: 'URL',
                                          },
                                          {
                                            value: 'storedFile',
                                            icon: 'DatabaseOutlined',
                                            title: 'Stored File',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-colors',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: 'backgroundStyleRow-color',
                                            label: 'Color',
                                            propertyName: 'background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-gradientColor',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: 'backgroundStyle-gradientColors',
                                            propertyName: 'background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-urls',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-url',
                                            propertyName: 'background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-image',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: 'backgroundStyle-image',
                                            propertyName: 'background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-storedFiles',
                                        parentId: 'backgroundStylePnl',
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-storedFile',
                                            jsSetting: false,
                                            propertyName: 'background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-controlss',
                                        parentId: 'backgroundStyleRow',
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: 'backgroundStyleRow-size',
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'background.size',
                                            dropdownOptions: [
                                              {
                                                value: 'cover',
                                                label: 'Cover',
                                              },
                                              {
                                                value: 'contain',
                                                label: 'Contain',
                                              },
                                              {
                                                value: 'auto',
                                                label: 'Auto',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: 'backgroundStyleRowl-position',
                                            label: 'Position',
                                            hideLabel: true,
                                            propertyName: 'background.position',
                                            dropdownOptions: [
                                              {
                                                value: 'center',
                                                label: 'Center',
                                              },
                                              {
                                                value: 'top',
                                                label: 'Top',
                                              },
                                              {
                                                value: 'left',
                                                label: 'Left',
                                              },
                                              {
                                                value: 'right',
                                                label: 'Right',
                                              },
                                              {
                                                value: 'bottom',
                                                label: 'Bottom',
                                              },
                                              {
                                                value: 'top left',
                                                label: 'Top Left',
                                              },
                                              {
                                                value: 'top right',
                                                label: 'Top Right',
                                              },
                                              {
                                                value: 'bottom left',
                                                label: 'Bottom Left',
                                              },
                                              {
                                                value: 'bottom right',
                                                label: 'Bottom Right',
                                              },
                                            ],
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-repeat',
                                        parentId: 'backgroundStyleRow',
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: 'backgroundStyleRow-repeat-radio',
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'shadowStyleCollapsiblePanel',
                                propertyName: 'pnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'shadowStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'shadowStyleRow',
                                        parentId: 'shadowStylePnl',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetX',
                                            label: 'Offset X',
                                            hideLabel: true,
                                            tooltip: 'Offset X',
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetY',
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            tooltip: 'Offset Y',
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-blurRadius',
                                            label: 'Blur',
                                            hideLabel: true,
                                            tooltip: 'Blur radius',
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-spreadRadius',
                                            label: 'Spread',
                                            hideLabel: true,
                                            tooltip: 'Spread radius',
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'shadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: 'shadowStyleRow-color',
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
                                id: 'borderStyleCollapsiblePanel',
                                propertyName: 'pnlBorderStyle',
                                label: 'Border',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'borderStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addContainer({
                                        id: 'borderStyleRow',
                                        parentId: 'borderStylePnl',
                                        propertyName: 'borderContainer',
                                        components: getBorderInputs() as any,
                                      })
                                      .addContainer({
                                        id: 'borderRadiusStyleRow',
                                        parentId: 'borderStylePnl',
                                        propertyName: 'borderRadiusContainer',
                                        components: getCornerInputs() as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'customStyleCollapsiblePanel',
                                propertyName: 'customStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'stylePnl-M500-911MFR',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'custom-css-412c-8461-4c8d55e5c073',
                                        inputType: 'codeEditor',
                                        propertyName: 'headerStyles',
                                        hideLabel: false,
                                        label: 'Style',
                                        description:
                                          'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
                        propertyName: 'columnStyles',
                        label: 'Column Styles',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: 'columnStyles.dimensionsStyleCollapsiblePanel',
                                propertyName: 'pnlcolumnStyles.dimensions',
                                label: 'Dimensions',
                                parentId: 'styleRouter',
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                  id: 'columnStyles.dimensionsStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'columnStyles.dimensionsStyleRowWidth',
                                        parentId: 'columnStyles.dimensionsStylePnl',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'width-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Width',
                                            width: 85,
                                            propertyName: 'columnStyles.dimensions.width',
                                            icon: 'widthIcon',
                                            tooltip:
                                              'You can use any unit (%, px, em, etc). px by default if without unit',
                                          },
                                          {
                                            type: 'textField',
                                            id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Min Width',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.minWidth',
                                            icon: 'minWidthIcon',
                                          },
                                          {
                                            type: 'textField',
                                            id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Max Width',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.maxWidth',
                                            icon: 'maxWidthIcon',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'columnStyles.dimensionsStyleRowHeight',
                                        parentId: 'columnStyles.dimensionsStylePnl',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'height-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Height',
                                            width: 85,
                                            propertyName: 'columnStyles.dimensions.height',
                                            icon: 'heightIcon',
                                            tooltip:
                                              'You can use any unit (%, px, em, etc). px by default if without unit',
                                          },
                                          {
                                            type: 'textField',
                                            id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Min Height',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.minHeight',
                                            icon: 'minHeightIcon',
                                          },
                                          {
                                            type: 'textField',
                                            id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
                                            label: 'Max Height',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.maxHeight',
                                            icon: 'maxHeightIcon',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'backgroundStyleCollapsiblePanels',
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'backgroundStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'backgroundStyleRow-selectTypes',
                                        parentId: 'backgroundStylePnl',
                                        label: 'Type',
                                        jsSetting: false,
                                        propertyName: 'columnStyles.background.type',
                                        inputType: 'radio',
                                        tooltip: 'Select a type of background',
                                        buttonGroupOptions: [
                                          {
                                            value: 'color',
                                            icon: 'FormatPainterOutlined',
                                            title: 'Color',
                                          },
                                          {
                                            value: 'gradient',
                                            icon: 'BgColorsOutlined',
                                            title: 'Gradient',
                                          },
                                          {
                                            value: 'image',
                                            icon: 'PictureOutlined',
                                            title: 'Image',
                                          },
                                          {
                                            value: 'url',
                                            icon: 'LinkOutlined',
                                            title: 'URL',
                                          },
                                          {
                                            value: 'storedFile',
                                            icon: 'DatabaseOutlined',
                                            title: 'Stored File',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-colors',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: 'backgroundStyleRow-color',
                                            label: 'Color',
                                            propertyName: 'columnStyles.background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-gradientColor',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: 'backgroundStyle-gradientColors',
                                            propertyName: 'columnStyles.background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-urls',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-url',
                                            propertyName: 'columnStyles.background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-image',
                                        parentId: 'backgroundStylePnl',
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: 'backgroundStyle-image',
                                            propertyName: 'columnStyles.background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-storedFiles',
                                        parentId: 'backgroundStylePnl',
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: 'backgroundStyle-storedFile',
                                            jsSetting: false,
                                            propertyName: 'columnStyles.background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-controlss',
                                        parentId: 'backgroundStyleRow',
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: 'backgroundStyleRow-size',
                                            label: 'Size',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.background.size',
                                            dropdownOptions: [
                                              {
                                                value: 'cover',
                                                label: 'Cover',
                                              },
                                              {
                                                value: 'contain',
                                                label: 'Contain',
                                              },
                                              {
                                                value: 'auto',
                                                label: 'Auto',
                                              },
                                            ],
                                          },
                                          {
                                            type: 'customDropdown',
                                            id: 'backgroundStyleRowl-position',
                                            label: 'Position',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.background.position',
                                            dropdownOptions: [
                                              {
                                                value: 'center',
                                                label: 'Center',
                                              },
                                              {
                                                value: 'top',
                                                label: 'Top',
                                              },
                                              {
                                                value: 'left',
                                                label: 'Left',
                                              },
                                              {
                                                value: 'right',
                                                label: 'Right',
                                              },
                                              {
                                                value: 'bottom',
                                                label: 'Bottom',
                                              },
                                              {
                                                value: 'top left',
                                                label: 'Top Left',
                                              },
                                              {
                                                value: 'top right',
                                                label: 'Top Right',
                                              },
                                              {
                                                value: 'bottom left',
                                                label: 'Bottom Left',
                                              },
                                              {
                                                value: 'bottom right',
                                                label: 'Bottom Right',
                                              },
                                            ],
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-repeat',
                                        parentId: 'backgroundStyleRow',
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: 'backgroundStyleRow-repeat-radio',
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'columnStyles.shadowStyleCollapsiblePanel',
                                propertyName: 'pnlcolumnStyles.shadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'columnStyles.shadowStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: 'columnStyles.shadowStyleRow',
                                        parentId: 'columnStyles.shadowStylePnl',
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetX',
                                            label: 'Offset X',
                                            hideLabel: true,
                                            tooltip: 'Offset X',
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'columnStyles.shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetY',
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            tooltip: 'Offset Y',
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'columnStyles.shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-blurRadius',
                                            label: 'Blur',
                                            hideLabel: true,
                                            tooltip: 'Blur radius',
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'columnStyles.shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-spreadRadius',
                                            label: 'Spread',
                                            hideLabel: true,
                                            tooltip: 'Spread radius',
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'columnStyles.shadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: 'shadowStyleRow-color',
                                            label: 'Color',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.shadow.color',
                                          },
                                        ],
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'columnStyles.borderStyleCollapsiblePanel',
                                propertyName: 'columnStyles.border',
                                label: 'Border',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'columnStyles.borderStylePnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: `columnStyles.borderStyle`,
                                        parentId: 'columnStyles.borderStylePnl',
                                        hidden: {
                                          _code:
                                            'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.border?.hideBorder);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'button',
                                            id: 'columnStyles.borderStyleRow-hideBorder',
                                            label: 'Border',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.border.hideBorder',
                                            icon: 'EyeOutlined',
                                            iconAlt: 'EyeInvisibleOutlined',
                                          },
                                        ],
                                      })
                                      .addContainer({
                                        id: 'columnStyles.borderStyleContainer',
                                        parentId: 'columnStyles.borderStylePnl',
                                        components: getBorderInputs('columnStyles', true) as any,
                                      })
                                      .addContainer({
                                        id: 'columnStyles.borderRadiusStyleRow',
                                        parentId: 'columnStyles.borderStylePnl',
                                        components: getCornerInputs('columnStyles', true) as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'panelheader-styling-box',
                                propertyName: 'columnStyles.stylingBox',
                                label: 'Margin and Padding',
                                labelAlign: 'right',
                                parentId: 'panel-header-styles-pnl',
                                collapsible: 'header',
                                content: {
                                  id: 'panelheader-styling-box-pnl',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addStyleBox({
                                        id: 'header-styleBoxPnl',
                                        label: 'Margin Padding',
                                        hideLabel: true,
                                        propertyName: 'columnStyles.stylingBox',
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: 'columncustomStyleCollapsiblePanel',
                                propertyName: 'columncustomStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: 'styleRouter',
                                collapsible: 'header',
                                content: {
                                  id: 'stylePnl-M500-911MFR',
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: 'column-custom-css-412c-8461-4c8d55e5c073',
                                        inputType: 'codeEditor',
                                        propertyName: 'columnStyle',
                                        hideLabel: false,
                                        label: 'Style',
                                        description:
                                          'A script that returns the style of the element as an object. This should conform to CSSProperties',
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
                  tooltip: 'Enter a list of permissions that should be associated with this component',
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
