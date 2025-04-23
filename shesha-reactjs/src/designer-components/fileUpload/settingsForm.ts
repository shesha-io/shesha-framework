import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import {
  positionOptions,
  repeatOptions,
  sizeOptions,
} from '../_settings/utils/background/utils';
import { FormLayout } from 'antd/es/form/Form';

export const getSettings = () => {
  return {
    components: new DesignerToolbarSettings()
      .addSearchableTabs({
        id: 'W_m7doMyCpCYwAYDfRh6I',
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
            id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                  propertyName: 'propertyName',
                  label: 'Property name',
                  validate: { required: true },
                  styledLabel: true,
                  jsSetting: true,
                })
                .addLabelConfigurator({
                  id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                  propertyName: 'hideLabel',
                  hideLabel: true,
                  label: 'Label',
                  hideLabelPropName: 'hideLabel'
                })
                .addSettingsInput({
                  id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
                  propertyName: 'description',
                  label: 'Tooltip',
                  inputType: 'textArea',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: 'b920ef96-ae27-4a01-bfad-list-type',
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: 'b920ef96-ae27-4a01-bfad-bob7d07218da',
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
                      id: 'cfd7d45e-c7e3-4a27-987b-dc525c412447',
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
                  id: 'display-row-1',
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      type: 'editModeSelector',
                      defaultValue: 'inherited',
                    },
                    {
                      id: 'b920ef96-ae27-4a01-bfad-b5b7d0xc18da',
                      propertyName: 'hideFileName',
                      label: 'Hide File Name',
                      type: 'switch',
                      hidden: {
                        _code: 'return getSettingValue(data?.listType) !== "thumbnail";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'b920ef96-ae27-hidefile-name-bfad-b5b7d0xc18da',
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
                      propertyName: 'hidden',
                      label: 'Hide',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: '40024b1c-edd4-4b5d-9c85-1dda6fb8db6c',
                      propertyName: 'allowUpload',
                      label: 'Allow Upload',
                      type: 'switch',
                      defaultValue: true,
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'display-row-2',
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: '6b3d298a-0e82-4420-ae3c-38bf5a2246d4',
                      propertyName: 'allowReplace',
                      label: 'Allow Replace',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: '332d298a-0e82-4420-ae3c-38bf5a2246d4',
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
            id: '9b302942-a0a6-4805-ac47-8f45486a69d4',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: 'display-row-3',
                  parentId: '9b302942-a0a6-4805-ac47-8f45486a69d4',
                  inputs: [
                    {
                      id: '1c03863c-880d-4308-8667-c3d996619cb7',
                      propertyName: 'ownerId',
                      label: 'Owner ID',
                      type: 'textField',
                    },
                    {
                      id: '1c03863c-880d-4308-8667-c3d996619cb8',
                      propertyName: 'ownerType',
                      label: 'Owner Type',
                      type: 'autocomplete',
                      dataSourceType: 'url',
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      useRawValues: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'display-row-4',
                  parentId: '9b302942-a0a6-4805-ac47-8f45486a69d4',
                  inputs: [
                    {
                      id: '3fe73b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                      propertyName: 'useSync',
                      label: 'Synchronous Upload',
                      type: 'switch',
                    },
                    {
                      id: '3fe73b1a-04c5-4658-ac0f-cbcbae6b3bd5',
                      propertyName: 'allowedFileTypes',
                      label: 'Allowed File Types',
                      type: 'editableTagGroupProps',
                      description: 'File types that can be accepted.',
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Validation',
            id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6f',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                })
                .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Appearance',
            id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
            components: [...new DesignerToolbarSettings()
              .addPropertyRouter({
                id: 'styleRouter',
                propertyName: 'propertyRouter1',
                componentName: 'propertyRouter',
                label: 'Property router1',
                labelAlign: 'right',
                parentId: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                hidden: false,
                propertyRouteName: {
                  _mode: "code",
                  _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: ""
                },
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
                        components: [...new DesignerToolbarSettings()
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
                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
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
                              {
                                type: 'dropdown',
                                id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
                                label: 'Align',
                                propertyName: 'font.align',
                                hideLabel: true,
                                width: 60,
                                hidden: { _code: 'return  getSettingValue(data.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                                dropdownOptions: textAlign,
                              },
                            ],
                          })
                          .addSettingsInput({
                            id: 'primary-color',
                            propertyName: 'primaryColor',
                            label: 'Primary Color',
                            inputType: 'colorPicker',
                            jsSetting: true,
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'dimensionsStyleCollapsiblePanel',
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: 'styleRouter',
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      hidden: { _code: 'return  getSettingValue(data.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: 'dimensionsStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'dimensionsStyleRowWidth',
                            parentId: 'dimensionsStylePnl',
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: 'width-s4gmBg31azZC0UjZjpfTm',
                                label: "Width",
                                width: 85,
                                propertyName: "dimensions.width",
                                icon: "widthIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                              },
                              {
                                type: 'textField',
                                id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                label: "Min Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minWidth",
                                icon: "minWidthIcon",
                              },
                              {
                                type: 'textField',
                                id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
                                label: "Max Width",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.maxWidth",
                                icon: "maxWidthIcon",
                              }
                            ]
                          })
                          .addSettingsInputRow({
                            id: 'dimensionsStyleRowHeight',
                            parentId: 'dimensionsStylePnl',
                            inline: true,
                            inputs: [
                              {
                                type: 'textField',
                                id: 'height-s4gmBg31azZC0UjZjpfTm',
                                label: "Height",
                                width: 85,
                                propertyName: "dimensions.height",
                                icon: "heightIcon",
                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                              },
                              {
                                type: 'textField',
                                id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                label: "Min Height",
                                width: 85,
                                hideLabel: true,
                                propertyName: "dimensions.minHeight",
                                icon: "minHeightIcon",
                              },
                              {
                                type: 'textField',
                                id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
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
                      id: 'borderStyleCollapsiblePanel',
                      propertyName: 'pnlBorderStyle',
                      label: 'Border',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      hidden: { _code: 'return  getSettingValue(data.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: 'borderStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'borderStyleRow-main',
                            parentId: 'borderStylePnl',
                            hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                            inputs: [
                              {
                                type: 'button',
                                id: 'borderStyleRow-hideBorder',
                                label: "Border",
                                hideLabel: true,
                                propertyName: "border.hideBorder",
                                icon: "EyeOutlined",
                                iconAlt: "EyeInvisibleOutlined"
                              },
                            ]
                          })
                          .addContainer({
                            id: 'borderStyleContainer',
                            parentId: 'borderStylePnl',
                            components: getBorderInputs() as any
                          })
                          .addContainer({
                            id: 'borderRadiusStyleContainer',
                            parentId: 'borderStylePnl',
                            components: getCornerInputs() as any
                          })
                          .toJson()
                        ]
                      }
                    })
                    .addCollapsiblePanel({
                      id: 'backgroundStyleCollapsiblePanel',
                      propertyName: 'pnlBackgroundStyle',
                      label: 'Background',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      hidden: { _code: 'return  getSettingValue(data.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: 'backgroundStylePnl',
                        components: [
                          ...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: "backgroundStyleRow-selectType",
                              parentId: "backgroundStylePnl",
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: [
                                {
                                  value: "color",
                                  icon: "FormatPainterOutlined",
                                  title: "Color"
                                },
                                {
                                  value: "gradient",
                                  icon: "BgColorsOutlined",
                                  title: "Gradient"
                                },
                                {
                                  value: "image",
                                  icon: "PictureOutlined",
                                  title: "Image"
                                },
                                {
                                  value: "url",
                                  icon: "LinkOutlined",
                                  title: "URL"
                                },
                                {
                                  value: "storedFile",
                                  icon: "DatabaseOutlined",
                                  title: "Stored File"
                                }
                              ],
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-color-row",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'colorPicker',
                                id: 'backgroundStyleRow-color-picker',
                                label: "Color",
                                propertyName: "background.color",
                                hideLabel: true,
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-gradientColors-row",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'multiColorPicker',
                                id: 'backgroundStyle-gradientColors-picker',
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              }
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-url-row",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'textField',
                                id: 'backgroundStyle-url-field',
                                propertyName: "background.url",
                                jsSetting: false,
                                label: "URL",
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-image-row",
                              parentId: 'backgroundStylePnl',
                              inputs: [{
                                type: 'imageUploader',
                                id: 'backgroundStyle-image-uploader',
                                propertyName: 'background.uploadFile',
                                label: "Image",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-storedFile-row",
                              parentId: 'backgroundStylePnl',
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: 'backgroundStyle-storedFile-field',
                                  jsSetting: false,
                                  propertyName: "background.storedFile.id",
                                  label: "File ID"
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-controls-row",
                              parentId: 'backgroundStylePnl',
                              inline: true,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-size-dropdown',
                                  label: "Size",
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  dropdownOptions: sizeOptions,
                                },
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-position-dropdown',
                                  label: "Position",
                                  hideLabel: true,
                                  customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                  propertyName: "background.position",
                                  dropdownOptions: positionOptions,
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: 'backgroundStyleRow-repeat-row',
                              parentId: 'backgroundStylePnl',
                              inputs: [{
                                type: 'radio',
                                id: 'backgroundStyleRow-repeat-radio',
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
                      id: 'shadowStyleCollapsiblePanel',
                      propertyName: 'pnlShadowStyle',
                      label: 'Shadow',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      hidden: { _code: 'return  getSettingValue(data.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: 'shadowStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'shadowStyleRow-main',
                            parentId: 'shadowStylePnl',
                            inline: true,
                            inputs: [
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetX-field',
                                label: 'Offset X',
                                hideLabel: true,
                                width: 80,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetY-field',
                                label: 'Offset Y',
                                hideLabel: true,
                                width: 80,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-blurRadius-field',
                                label: 'Blur',
                                hideLabel: true,
                                width: 80,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-spreadRadius-field',
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
                          .toJson()
                        ]
                      }
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
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: 'custom-css-412c-8461-4c8d55e5c073',
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            hideLabel: false,
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
            id: '6Vw9iiDw9d0MD_Rh5cbIn',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: '6Vw9iiDw9d0MD_Rh5cbIn',
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