import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { FormLayout } from 'antd/es/form/Form';
import { nanoid } from '@/utils/uuid';

export const getSettings = () => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();

  return {
    components: new DesignerToolbarSettings()
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
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property name',
                  validate: { required: true },
                  styledLabel: true,
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  hideLabel: true,
                  label: 'Label',
                  hideLabelPropName: 'hideLabel',
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'description',
                  label: 'Tooltip',
                  inputType: 'textArea',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'listType',
                      label: 'List Type',
                      type: 'dropdown',
                      defaultValue: 'text',
                      dropdownOptions: [
                        { label: 'File name', value: 'text' },
                        { label: 'Thumbnail', value: 'thumbnail' },
                      ],
                      hidden: {
                        _code: 'return getSettingValue(data?.isDragger);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'isDragger',
                      label: 'Is Dragger',
                      type: 'switch',
                      description: 'Where the uploader should show a dragger instead of a button',
                      hidden: {
                        _code: 'return getSettingValue(data?.listType) === "thumbnail";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                   id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      type: 'editModeSelector',
                      defaultValue: 'inherited',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'hideFileName',
                      label: 'Hide File Name',
                      type: 'switch',
                      jsSetting: true,
                      hidden: {
                        _code: 'return getSettingValue(data?.listType) !== "thumbnail";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'allowUpload',
                      label: 'Allow Upload',
                      type: 'switch',
                      defaultValue: true,
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'allowReplace',
                      label: 'Allow Replace',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'allowDelete',
                      label: 'Allow Delete',
                      type: 'switch',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'ownerId',
                      label: 'Owner ID',
                      type: 'textField',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'ownerType',
                      label: 'Owner Type',
                      type: 'autocomplete',
                      dataSourceType: 'url',
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      useRawValues: true,
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'useSync',
                      label: 'Synchronous Upload',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'allowedFileTypes',
                      label: 'Allowed File Types',
                      type: 'editableTagGroupProps',
                      description: 'File types that can be accepted.',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Validation',
            id: validationTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                  jsSetting: true,
                })
                .toJson(),
            ],
          },
          {
            key: '4',
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
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
                  },
                  components: [
                    ...new DesignerToolbarSettings()
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlFontStyle',
                        label: 'Font',
                        labelAlign: 'right',
                        parentId: styleRouterId,
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: 'fontStylePnl',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'fontStylePnl',
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
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Align',
                                    propertyName: 'font.align',
                                    hideLabel: true,
                                    width: 60,
                                    hidden: {
                                      _code: 'return  getSettingValue(data.listType) !== "thumbnail";',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                    dropdownOptions: textAlign,
                                  },
                                ],
                              })
                              .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'primaryColor',
                                label: 'Primary Color',
                                inputType: 'colorPicker',
                                jsSetting: true,
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: 'styleRouter',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  getSettingValue(data.listType) !== "thumbnail";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
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
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxWidth',
                                    icon: 'maxWidthIcon',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
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
                                  },
                                  {
                                    type: 'textField',
                                    id: nanoid(),
                                    label: 'Max Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxHeight',
                                    icon: 'maxHeightIcon',
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
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  getSettingValue(data.listType) !== "thumbnail";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: 'borderStylePnl',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: {
                                  _code:
                                    'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'button',
                                    id: nanoid(),
                                    label: 'Border',
                                    hideLabel: true,
                                    propertyName: 'border.hideBorder',
                                    icon: 'EyeOutlined',
                                    iconAlt: 'EyeInvisibleOutlined',
                                  },
                                ],
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: 'borderStylePnl',
                                components: getBorderInputs() as any,
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: 'borderStylePnl',
                                components: getCornerInputs() as any,
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
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  getSettingValue(data.listType) !== "thumbnail";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: 'backgroundStylePnl',
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                parentId: styleRouterId,
                                inputs: [
                                  {
                                    type: 'colorPicker',
                                    id: 'backgroundStyleRow-color-picker',
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
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                hideLabel: true,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";',
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
                                id: nanoid(),
                                parentId: 'backgroundStylePnl',
                                inline: true,
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
                                    label: 'Size',
                                    hideLabel: true,
                                    propertyName: 'background.size',
                                    customTooltip:
                                      'Size of the background image, two space separated values with units e.g "100% 100px"',
                                    dropdownOptions: sizeOptions,
                                  },
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
                                    label: 'Position',
                                    hideLabel: true,
                                    customTooltip:
                                      'Position of the background image, two space separated values with units e.g "5em 100px"',
                                    propertyName: 'background.position',
                                    dropdownOptions: positionOptions,
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                        id: nanoid(),
                        propertyName: 'pnlShadowStyle',
                        label: 'Shadow',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        hidden: {
                          _code: 'return  getSettingValue(data.listType) !== "thumbnail";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                                    width: 80,
                                    icon: 'offsetHorizontalIcon',
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
                                    id: 'shadowStyleRow-color-picker',
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
                        propertyName: 'customStyle',
                        label: 'Custom Styles',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'style',
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
                })
                .toJson(),
            ],
          },
          {
            key: '5',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  jsSetting: true,
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
