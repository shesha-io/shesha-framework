import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { IKanbanProps } from '@/components/kanban/model';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';

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
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'entityType',
                  label: 'Entity Type',
                  parentId: commonTabId,
                  inputType: 'autocomplete',
                  dataSourceType: 'url',
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'modalFormId',
                  label: 'Render Form',
                  parentId: commonTabId,
                  inputType: 'formAutocomplete',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'propertyAutocomplete',
                      id: nanoid(),
                      propertyName: 'groupingProperty',
                      label: 'Grouping property',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'maxResultCount',
                      label: 'Max Result Count',
                      type: 'numberField',
                      parentId: commonTabId,
                      jsSetting: true,
                    },
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
                      propertyName: 'collapsible',
                      label: 'Collapsible',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'kanbanReadonly',
                      label: 'Readonly',
                      jsSetting: true,
                    },
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
                      propertyName: 'allowDelete',
                      label: 'Allow Delete',
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showIcons',
                      label: 'Show Icons',
                      jsSetting: true,
                    },
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
                      propertyName: 'allowNewRecord',
                      label: 'Allow New Record',
                      jsSetting: true,
                    },
                    {
                      type: 'formAutocomplete',
                      id: nanoid(),
                      propertyName: 'createFormId',
                      label: 'Create Form',
                      jsSetting: true,
                      hidden: {
                        _code: 'return !getSettingValue(data?.allowNewRecord);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
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
                      propertyName: 'allowEdit',
                      label: 'Allow Edit',
                      jsSetting: true,
                    },
                    {
                      type: 'formAutocomplete',
                      id: nanoid(),
                      propertyName: 'editFormId',
                      label: 'Edit Form',
                      jsSetting: true,
                      hidden: {
                        _code: 'return !getSettingValue(data?.allowEdit);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                  ],
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .toJson(),
            ],
          },
          {
            key: 'columns',
            title: 'Columns',
            id: columnsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: columnsTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                  label: '',
                  labelAlign: 'right',
                  parentId: columnsTabId,
                  referenceList: {
                    _code: 'return getSettingValue(data?.referenceList);',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputType: 'RefListItemSelectorSettingsModal',
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                              id: 'customBackgroundPanel',
                              propertyName: 'pnlCustomBackground',
                              label: 'Background',
                              labelAlign: 'right',
                              ghost: true,
                              parentId: 'customStyleRouter',
                              collapsible: 'header',
                              content: {
                                id: 'customBackgroundPnl',
                                components: [
                                  ...new DesignerToolbarSettings()
                                    .addSettingsInput({
                                      id: 'customBackgroundRow-selectType',
                                      parentId: 'customBackgroundPnl',
                                      label: 'Type',
                                      jsSetting: false,
                                      propertyName: 'columnBackground.type',
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
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-color',
                                      parentId: 'customBackgroundPnl',
                                      inputs: [
                                        {
                                          type: 'colorPicker',
                                          id: 'customBackgroundRow-colorPicker',
                                          label: 'Color',
                                          propertyName: 'columnBackground.color',
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
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-gradientColors',
                                      parentId: 'customBackgroundPnl',
                                      inputs: [
                                        {
                                          type: 'multiColorPicker',
                                          id: 'customBackgroundRow-gradientColorsPicker',
                                          propertyName: 'columnBackground.gradient.colors',
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
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-url',
                                      parentId: 'customBackgroundPnl',
                                      inputs: [
                                        {
                                          type: 'textField',
                                          id: 'customBackgroundRow-urlInput',
                                          propertyName: 'columnBackground.url',
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
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-image',
                                      parentId: 'customBackgroundPnl',
                                      inputs: [
                                        {
                                          type: 'imageUploader',
                                          id: 'customBackgroundRow-imageUploader',
                                          propertyName: 'columnBackground.uploadFile',
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
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-storedFile',
                                      parentId: 'customBackgroundPnl',
                                      hidden: {
                                        _code:
                                          'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      inputs: [
                                        {
                                          type: 'textField',
                                          id: 'customBackgroundRow-storedFileInput',
                                          jsSetting: false,
                                          propertyName: 'columnBackground.storedFile.id',
                                          label: 'File ID',
                                        },
                                      ],
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-controls',
                                      parentId: 'customBackgroundRow',
                                      inline: true,
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      inputs: [
                                        {
                                          type: 'customDropdown',
                                          id: 'customBackgroundRow-sizeDropdown',
                                          label: 'Size',
                                          hideLabel: true,
                                          propertyName: 'columnBackground.size',
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
                                          id: 'customBackgroundRow-positionDropdown',
                                          label: 'Position',
                                          hideLabel: true,
                                          propertyName: 'columnBackground.position',
                                          dropdownOptions: positionOptions,
                                        },
                                      ],
                                    })
                                    .addSettingsInputRow({
                                      id: 'customBackgroundRow-repeat',
                                      parentId: 'customBackgroundRow',
                                      readOnly: {
                                        _code: 'return getSettingValue(data?.readOnly);',
                                        _mode: 'code',
                                        _value: false,
                                      } as any,
                                      inputs: [
                                        {
                                          type: 'radio',
                                          id: 'customBackgroundRow-repeatRadio',
                                          label: 'Repeat',
                                          hideLabel: true,
                                          propertyName: 'columnBackground.repeat',
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
                            
                              // .addSettingsInputRow({
                              //   id: nanoid(),
                              //   parentId: styleRouterId,
                              //   inputs: [
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'gap',
                              //       label: 'Gap',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'colorPicker',
                              //       id: nanoid(),
                              //       propertyName: 'columnBackgroundColor',
                              //       label: 'Background Color',
                              //       jsSetting: true,
                              //       allowClear: true,
                              //     },
                              //   ],
                              //   readOnly: {
                              //     _code: 'return getSettingValue(data?.readOnly);',
                              //     _mode: 'code',
                              //     _value: false,
                              //   } as any,
                              // })
                              // .addSettingsInputRow({
                              //   id: nanoid(),
                              //   parentId: styleRouterId,
                              //   inputs: [
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'width',
                              //       label: 'Width',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'minWidth',
                              //       label: 'Min Width',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'maxWidth',
                              //       label: 'Max Width',
                              //       jsSetting: true,
                              //     },
                              //   ],
                              //   readOnly: {
                              //     _code: 'return getSettingValue(data?.readOnly);',
                              //     _mode: 'code',
                              //     _value: false,
                              //   } as any,
                              // })
                              // .addSettingsInputRow({
                              //   id: nanoid(),
                              //   parentId: styleRouterId,
                              //   inputs: [
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'height',
                              //       label: 'Height',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'minHeight',
                              //       label: 'Min Height',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'maxHeight',
                              //       label: 'Max Height',
                              //       jsSetting: true,
                              //     },
                              //   ],
                              //   readOnly: {
                              //     _code: 'return getSettingValue(data?.readOnly);',
                              //     _mode: 'code',
                              //     _value: false,
                              //   } as any,
                              // })
                              // .addSettingsInput({
                              //   id: nanoid(),
                              //   propertyName: 'columnStyle',
                              //   label: 'Style',
                              //   parentId: styleRouterId,
                              //   inputType: 'codeEditor',
                              //   description: 'CSS Style',
                              // })
                              .toJson(),
                          ],
                        },
                      })
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
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
                                id: 'backgroundStyleCollapsiblePanel',
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
                                        id: 'backgroundStyleRow-selectType',
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-color',
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-gradientColors',
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyle-url',
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-storedFile',
                                        parentId: 'backgroundStylePnl',
                                        hidden: {
                                          _code:
                                            'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
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
                                        id: 'backgroundStyleRow-controls',
                                        parentId: 'backgroundStyleRow',
                                        inline: true,
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
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
                                            id: 'backgroundStyleRow-position',
                                            label: 'Position',
                                            hideLabel: true,
                                            propertyName: 'background.position',
                                            dropdownOptions: positionOptions,
                                          },
                                        ],
                                      })
                                      .addSettingsInputRow({
                                        id: 'backgroundStyleRow-repeat',
                                        parentId: 'backgroundStyleRow',
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
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
                                        readOnly: {
                                          _code: 'return  getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetX',
                                            label: 'Offset X',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetHorizontalIcon',
                                            propertyName: 'shadow.offsetX',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-offsetY',
                                            label: 'Offset Y',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'offsetVerticalIcon',
                                            propertyName: 'shadow.offsetY',
                                          },
                                          {
                                            type: 'numberField',
                                            id: 'shadowStyleRow-blurRadius',
                                            label: 'Blur',
                                            hideLabel: true,
                                            width: 80,
                                            icon: 'blurIcon',
                                            propertyName: 'shadow.blurRadius',
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
                                      .addSettingsInputRow({
                                        id: `borderStyleRow`,
                                        parentId: 'borderStylePnl',
                                        hidden: {
                                          _code:
                                            'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        readOnly: {
                                          _code: 'return getSettingValue(data?.readOnly);',
                                          _mode: 'code',
                                          _value: false,
                                        } as any,
                                        inputs: [
                                          {
                                            type: 'button',
                                            id: 'borderStyleRow-hideBorder',
                                            label: 'Border',
                                            hideLabel: true,
                                            propertyName: 'border.hideBorder',
                                            icon: 'EyeOutlined',
                                            iconAlt: 'EyeInvisibleOutlined',
                                          },
                                        ],
                                      })
                                      .addContainer({
                                        id: 'borderStyleRow',
                                        parentId: 'borderStylePnl',
                                        components: getBorderInputs() as any,
                                      })
                                      .addContainer({
                                        id: 'borderRadiusStyleRow',
                                        parentId: 'borderStylePnl',
                                        components: getCornerInputs() as any,
                                      })
                                      .toJson(),
                                  ],
                                },
                              })
                              // .addSettingsInputRow({
                              //   id: nanoid(),
                              //   parentId: styleRouterId,
                              //   inputs: [
                              //     {
                              //       type: 'numberField',
                              //       id: nanoid(),
                              //       propertyName: 'fontSize',
                              //       label: 'Font Size',
                              //       jsSetting: true,
                              //     },
                              //     {
                              //       type: 'colorPicker',
                              //       id: nanoid(),
                              //       propertyName: 'fontColor',
                              //       label: 'Font Color',
                              //       jsSetting: true,
                              //       allowClear: true,
                              //     },
                              //     {
                              //       type: 'colorPicker',
                              //       id: nanoid(),
                              //       propertyName: 'headerBackgroundColor',
                              //       label: 'Background Color',
                              //       jsSetting: true,
                              //       allowClear: true,
                              //     },
                              //   ],
                              //   readOnly: {
                              //     _code: 'return getSettingValue(data?.readOnly);',
                              //     _mode: 'code',
                              //     _value: false,
                              //   } as any,
                              // })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'headerStyles',
                                label: 'Style',
                                parentId: styleRouterId,
                                inputType: 'codeEditor',
                                mode: 'dialog',
                                description: 'CSS Style',
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
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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