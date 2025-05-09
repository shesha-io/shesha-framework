import { IKanbanProps } from '@/components/kanban/model';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { repeatOptions } from '../_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { fontTypes, fontWeights } from '../_settings/utils/font/utils';

export const getSettings = (data: IKanbanProps) => {
  // Generate unique IDs for top-level components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const columnsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();

  // Generate IDs for nested panels in appearance tab
  const headerStylesPanelId = nanoid();
  const headerStylesContentId = nanoid();
  const columnStylesPanelId = nanoid();
  const columnStylesContentId = nanoid();

  // Generate IDs for font style panels
  const fontStylePanelId = nanoid();
  const fontStyleContentId = nanoid();
  const fontStyleRowId = nanoid();

  // Generate IDs for background panels
  const bgStylePanelId = nanoid();
  const bgStyleContentId = nanoid();
  //const bgStyleRowId = nanoid();
  const bgStyleControlsRowId = nanoid();
  const bgStyleRepeatRowId = nanoid();

  // Generate IDs for shadow panels
  const shadowStylePanelId = nanoid();
  const shadowStyleContentId = nanoid();
  const shadowStyleRowId = nanoid();

  // Generate IDs for border panels
  const borderStylePanelId = nanoid();
  const borderStyleContentId = nanoid();
  const borderStyleRowId = nanoid();
  const borderRadiusRowId = nanoid();

  // Generate IDs for custom style panels
  const customStylePanelId = nanoid();
  const customStyleContentId = nanoid();

  // Generate IDs for column style panels
  const colDimensionsPanelId = nanoid();
  const colDimensionsContentId = nanoid();
  const colDimensionsWidthRowId = nanoid();
  const colDimensionsHeightRowId = nanoid();
  const colBgPanelId = nanoid();
  const colBgContentId = nanoid();
  const colShadowPanelId = nanoid();
  const colShadowContentId = nanoid();
  const colShadowRowId = nanoid();
  const colBorderPanelId = nanoid();
  const colBorderContentId = nanoid();
  const colBorderStyleId = nanoid();
  const colBorderContainerId = nanoid();
  const colBorderRadiusRowId = nanoid();
  const colMarginPaddingPanelId = nanoid();
  const colMarginPaddingContentId = nanoid();
  const colCustomStylePanelId = nanoid();
  const colCustomStyleContentId = nanoid();

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
                .addSettingsInput({
                  id: nanoid(),
                  parentId: columnsTabId,
                      inputType: 'referenceListAutocomplete',
                      propertyName: 'referenceList',
                      label: 'Reference List',
                      tooltip: 'Make sure to reselect the reference list if any changes are made to its items',
                      filter: { and: [{ '==': [{ var: 'isLast' }, true] }] },
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
                        id: headerStylesPanelId,
                        propertyName: 'headerStyles',
                        label: 'Header Styles',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: headerStylesContentId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: fontStylePanelId,
                                propertyName: 'pnlFontStyle',
                                label: 'Font',
                                labelAlign: 'right',
                                parentId: headerStylesContentId,
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                  id: fontStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: fontStyleRowId,
                                        parentId: fontStyleContentId,
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
                                            tooltip: 'Controls text thickness (light, normal, bold, etc.)',
                                            dropdownOptions: fontWeights,
                                            width: 100,
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
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
                                id: bgStylePanelId,
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: headerStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: bgStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
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
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            propertyName: 'background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: nanoid(),
                                            propertyName: 'background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            propertyName: 'background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: nanoid(),
                                            propertyName: 'background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: bgStyleContentId,
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            jsSetting: false,
                                            propertyName: 'background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: bgStyleControlsRowId,
                                        parentId: bgStyleContentId,
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
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
                                            id: nanoid(),
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
                                        id: bgStyleRepeatRowId,
                                        parentId: bgStyleContentId,
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: shadowStylePanelId,
                                propertyName: 'pnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: headerStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: shadowStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: shadowStyleRowId,
                                        parentId: shadowStyleContentId,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset X',
                                            hideLabel: true,
                                            tooltip: 'Offset X',
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
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
                                            tooltip: 'Blur radius',
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Spread',
                                            hideLabel: true,
                                            tooltip: 'Spread radius',
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
                                id: borderStylePanelId,
                                propertyName: 'pnlBorderStyle',
                                label: 'Border',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: headerStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: borderStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addContainer({
                                        id: borderStyleRowId,
                                        parentId: borderStyleContentId,
                                        propertyName: 'borderContainer',
                                        components: getBorderInputs() as any,
                                      })
                                      .addContainer({
                                        id: borderRadiusRowId,
                                        parentId: borderStyleContentId,
                                        propertyName: 'borderRadiusContainer',
                                        components: getCornerInputs() as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: customStylePanelId,
                                propertyName: 'customStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: headerStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: customStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
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
                        id: columnStylesPanelId,
                        propertyName: 'columnStyles',
                        label: 'Column Styles',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: columnStylesContentId,
                          components: [
                            ...new DesignerToolbarSettings()
                              .addCollapsiblePanel({
                                id: colDimensionsPanelId,
                                propertyName: 'pnlcolumnStyles.dimensions',
                                label: 'Dimensions',
                                parentId: columnStylesContentId,
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                  id: colDimensionsContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: colDimensionsWidthRowId,
                                        parentId: colDimensionsContentId,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            label: 'Width',
                                            width: 85,
                                            propertyName: 'columnStyles.dimensions.width',
                                            icon: 'widthIcon',
                                            tooltip:
                                              'You can use any unit (%, px, em, etc). px by default if without unit',
                                          },
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            label: 'Min Width',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.minWidth',
                                            icon: 'minWidthIcon',
                                          },
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            label: 'Max Width',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.maxWidth',
                                            icon: 'maxWidthIcon',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: colDimensionsHeightRowId,
                                        parentId: colDimensionsContentId,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            label: 'Height',
                                            width: 85,
                                            propertyName: 'columnStyles.dimensions.height',
                                            icon: 'heightIcon',
                                            tooltip:
                                              'You can use any unit (%, px, em, etc). px by default if without unit',
                                          },
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            label: 'Min Height',
                                            width: 85,
                                            hideLabel: true,
                                            propertyName: 'columnStyles.dimensions.minHeight',
                                            icon: 'minHeightIcon',
                                          },
                                          {
                                            type: 'textField',
                                            id: nanoid(),
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
                                id: colBgPanelId,
                                propertyName: 'pnlBackgroundStyle',
                                label: 'Background',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: columnStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: colBgContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
                                        parentId: colBgContentId,
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
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        inputs: [
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
                                            label: 'Color',
                                            propertyName: 'columnStyles.background.color',
                                            hideLabel: true,
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        inputs: [
                                          {
                                            type: 'multiColorPicker',
                                            id: nanoid(),
                                            propertyName: 'columnStyles.background.gradient.colors',
                                            label: 'Colors',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "gradient";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        hideLabel: true,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            propertyName: 'columnStyles.background.url',
                                            jsSetting: false,
                                            label: 'URL',
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "url";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        inputs: [
                                          {
                                            type: 'imageUploader',
                                            id: nanoid(),
                                            propertyName: 'columnStyles.background.uploadFile',
                                            label: 'Image',
                                            jsSetting: false,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "image";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'textField',
                                            id: nanoid(),
                                            jsSetting: false,
                                            propertyName: 'columnStyles.background.storedFile.id',
                                            label: 'File ID',
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'customDropdown',
                                            id: nanoid(),
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
                                            id: nanoid(),
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
                                        id: nanoid(),
                                        parentId: colBgContentId,
                                        inputs: [
                                          {
                                            type: 'radio',
                                            id: nanoid(),
                                            label: 'Repeat',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.background.repeat',
                                            inputType: 'radio',
                                            buttonGroupOptions: repeatOptions,
                                          },
                                        ],
                                        hidden: {
                                          _code:
                                            'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.background?.type) === "color";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: colShadowPanelId,
                                propertyName: 'pnlcolumnStyles.shadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: columnStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: colShadowContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: colShadowRowId,
                                        parentId: colShadowContentId,
                                        inline: true,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset X',
                                            hideLabel: true,
                                            tooltip: 'Offset X',
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'columnStyles.shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            tooltip: 'Offset Y',
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'columnStyles.shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Blur',
                                            hideLabel: true,
                                            tooltip: 'Blur radius',
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'columnStyles.shadow.blurRadius',
                                          },
                                          {
                                            type: 'numberField',
                                            id: nanoid(),
                                            label: 'Spread',
                                            hideLabel: true,
                                            tooltip: 'Spread radius',
                                            width: 80,
                                            icon: 'spreadIcon',
                                            propertyName: 'columnStyles.shadow.spreadRadius',
                                          },
                                          {
                                            type: 'colorPicker',
                                            id: nanoid(),
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
                                id: colBorderPanelId,
                                propertyName: 'columnStyles.border',
                                label: 'Border',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: columnStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: colBorderContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInputRow({
                                        id: colBorderStyleId,
                                        parentId: colBorderContentId,
                                        hidden: {
                                          _code:
                                            'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.columnStyles.border?.hideBorder);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'button',
                                            id: nanoid(),
                                            label: 'Border',
                                            hideLabel: true,
                                            propertyName: 'columnStyles.border.hideBorder',
                                            icon: 'EyeOutlined',
                                            iconAlt: 'EyeInvisibleOutlined',
                                          },
                                        ],
                                      })
                                      .addContainer({
                                        id: colBorderContainerId,
                                        parentId: colBorderContentId,
                                        components: getBorderInputs('columnStyles', true) as any,
                                      })
                                      .addContainer({
                                        id: colBorderRadiusRowId,
                                        parentId: colBorderContentId,
                                        components: getCornerInputs('columnStyles', true) as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: colMarginPaddingPanelId,
                                propertyName: 'columnStyles.stylingBox',
                                label: 'Margin and Padding',
                                labelAlign: 'right',
                                parentId: columnStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: colMarginPaddingContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addStyleBox({
                                        id: nanoid(),
                                        label: 'Margin Padding',
                                        hideLabel: true,
                                        propertyName: 'columnStyles.stylingBox',
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              .addCollapsiblePanel({
                                id: colCustomStylePanelId,
                                propertyName: 'columncustomStyle',
                                label: 'Custom Styles',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: columnStylesContentId,
                                collapsible: 'header',
                                content: {
                                  id: colCustomStyleContentId,
                                  components: [
                                    ...new DesignerToolbarSettings()
                                      .addSettingsInput({
                                        id: nanoid(),
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