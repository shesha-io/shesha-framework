import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { nanoid } from '@/utils/uuid';
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
            title: 'Display',
            id: '11114bf6-f76d-4139-a850-c99bf06c8b69',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                  propertyName: 'componentName',
                  label: 'Component name',
                  inputType: 'propertyAutocomplete',
                  validate: { required: true },
                  jsSetting: false,
                })
                .addLabelConfigurator({
                  id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                  propertyName: 'hideLabel',
                  hideLabel: true,
                  label: 'Label'
                })
                .addSettingsInput({
                  id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
                  propertyName: 'description',
                  label: 'Tooltip',
                  inputType: 'textArea',
                })
                .addSettingsInputRow({
                  id: 'display-row-0-dragger',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: 'cfd7d45e-c7e3-4a27-987b-dc525c412447',
                      propertyName: 'isDragger',
                      label: 'Is Dragger',
                      type: 'switch',
                      description: 'Where the uploader should show a dragger instead of a button',
                    }
                  ],
                  hidden: { _code: 'return getSettingValue(data?.listType) === "thumbnail";', _mode: 'code', _value: false } as any,
                })
                .addSettingsInputRow({
                  id: 'b920ef96-ae27-4a01-bfad-list-type',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  hidden: { _code: 'return getSettingValue(data?.isDragger);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: 'b920ef96-ae27-4a01-bfad-bob7d07218da',
                      propertyName: 'listType',
                      label: 'List Type',
                      type: 'dropdown',
                      dropdownOptions: [
                        { label: 'File Name', value: 'text' },
                        { label: 'Thumbnail', value: 'thumbnail' },
                      ],
                    }]
                })
                .addSettingsInputRow({
                  id: 'b920ef96-layout-4a01-bfad-bob7d07218da',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail" || getSettingValue(data?.isDragger);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: 'f01e54aa-a1a4-4bd6-ba73-c39te48af8ce',
                      propertyName: 'filesLayout',
                      label: 'Layout',
                      type: 'dropdown',
                      dropdownOptions: [
                        { label: 'Vertical', value: 'vertical' },
                        { label: 'Horizontal', value: 'horizontal' },
                        { label: 'Grid', value: 'grid' },
                      ]
                    },]
                })
                .addSettingsInputRow({
                  id: 'b920ef96-thumbnail-4a01-bfad-bob7d07218da',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: 'b920ef96-ae27-4a01-bfad-b5b7d07218da',
                      propertyName: 'gap',
                      label: 'Gap',
                      type: 'numberField',
                      description: 'The gap between the thumbnails.',
                    }]
                })
                .addSettingsInputRow({
                  id: 'display-row-1',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
                      propertyName: 'hidden',
                      label: 'Hide',
                      type: 'switch',
                    },
                    {
                      id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      type: 'editModeSelector',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: 'b920ef96-ae27-hidefile-name-bfad-b5b7d0xc18da',
                  hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [{
                    id: 'b920ef96-ae27-4a01-bfad-b5b7d0xc18da',
                    propertyName: 'hideFileName',
                    label: 'Hide File Name',
                    type: 'switch',
                  }]
                })
                .addSettingsInputRow({
                  id: 'display-row-2',
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  parentId: '11114bf6-f76d-4139-a850-c99bf06c8b69',
                  inputs: [
                    {
                      id: '40024b1c-edd4-4b5d-9c85-1dda6fb8db6c',
                      propertyName: 'allowAdd',
                      label: 'Allow Add',
                      type: 'switch',
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
                    },
                    {
                      id: '6b3d298a-0e82-4420-ae3c-38bf5a2246d4',
                      propertyName: 'allowDelete',
                      label: 'Allow Remove',
                      type: 'switch',
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
                    },
                  ],
                })
                .addSettingsInput({
                  id: '332d298a-0e82-4420-ae3c-38bf5a2246d4',
                  propertyName: 'downloadZip',
                  label: 'Download Zip',
                  inputType: 'switch',
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
                .addSettingsInput({
                  id: '3fe73b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                  propertyName: 'ownerName',
                  label: 'Owner',
                  inputType: 'propertyAutocomplete',
                  autoFillProps: false,
                })
                .addSettingsInput({
                  id: '1c03863c-880d-4308-8667-c3d996619cb7',
                  propertyName: 'ownerId',
                  label: 'Owner Id',
                  inputType: 'textField',
                })
                .addSettingsInput({
                  id: '0009bf13-04a3-49d5-a9d8-1b23df20b97c',
                  propertyName: 'ownerType',
                  label: 'Owner Type',
                  inputType: 'autocomplete',
                  dataSourceType: 'url',
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  useRawValues: true,
                })
                .addSettingsInput({
                  id: 'db913b1b-3b25-46c9-afef-21854d917ba7',
                  propertyName: 'filesCategory',
                  label: 'Files Category',
                  inputType: 'textField',
                })
                .addSettingsInput({
                  id: nanoid

                    (),
                  propertyName: 'allowedFileTypes',
                  label: 'Allowed File Types',
                  inputType: 'editableTagGroupProps',
                  description: 'File types that can be accepted.',
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
            title: 'Events',
            id: 'Cc47W08MWrKdhoGqFKMI2',
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: '48ff91b3-5fb1-4e1b-a17f-ff86bce22e0b',
                propertyName: 'onFileChanged',
                label: 'On File List Changed',
                inputType: 'codeEditor',
                description: 'Callback that is triggered when the file is changed.'
              })
              .toJson()
            ]
          },
          {
            key: '5',
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
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                dropdownOptions: textAlign,
                              },
                            ],
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
                      content: {
                        id: 'dimensionsStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'dimensionsStyleRowWidth',
                            parentId: 'dimensionsStylePnl',
                            inline: true,
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                      content: {
                        id: 'borderStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: `borderStyleRow`,
                            parentId: 'borderStylePnl',
                            hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                            id: 'borderStyleRow',
                            parentId: 'borderStylePnl',
                            components: getBorderInputs() as any
                          })
                          .addContainer({
                            id: 'borderRadiusStyleRow',
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
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-color",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'colorPicker',
                                id: 'backgroundStyleRow-color',
                                label: "Color",
                                propertyName: "background.color",
                                hideLabel: true,
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-gradientColors",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'multiColorPicker',
                                id: 'backgroundStyle-gradientColors',
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              }
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-url",
                              parentId: "backgroundStylePnl",
                              inputs: [{
                                type: 'textField',
                                id: 'backgroundStyle-url',
                                propertyName: "background.url",
                                jsSetting: false,
                                label: "URL",
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyle-image",
                              parentId: 'backgroundStylePnl',
                              inputs: [{
                                type: 'imageUploader',
                                id: 'backgroundStyle-image',
                                propertyName: 'background.uploadFile',
                                label: "Image",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-storedFile",
                              parentId: 'backgroundStylePnl',
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'textField',
                                  id: 'backgroundStyle-storedFile',
                                  jsSetting: false,
                                  propertyName: "background.storedFile.id",
                                  label: "File ID"
                                }
                              ]
                            })
                            .addSettingsInputRow({
                              id: "backgroundStyleRow-controls",
                              parentId: 'backgroundStyleRow',
                              inline: true,
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-size',
                                  label: "Size",
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                  dropdownOptions: sizeOptions,
                                },
                                {
                                  type: 'customDropdown',
                                  id: 'backgroundStyleRow-position',
                                  label: "Position",
                                  hideLabel: true,
                                  customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                  propertyName: "background.position",
                                  dropdownOptions: positionOptions,
                                },
                                {
                                  type: 'radio',
                                  id: 'backgroundStyleRow-repeat',
                                  label: "Repeat",
                                  hideLabel: true,
                                  propertyName: "background.repeat",
                                  buttonGroupOptions: repeatOptions,
                                }
                              ]
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
                      content: {
                        id: 'shadowStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: 'shadowStyleRow',
                            parentId: 'shadowStylePnl',
                            inline: true,
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            inputs: [
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetX',
                                label: 'Offset X',
                                hideLabel: true,
                                width: 60,
                                icon: "offsetHorizontalIcon",
                                propertyName: 'shadow.offsetX',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-offsetY',
                                label: 'Offset Y',
                                hideLabel: true,
                                width: 60,
                                icon: 'offsetVerticalIcon',
                                propertyName: 'shadow.offsetY',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-blurRadius',
                                label: 'Blur',
                                hideLabel: true,
                                width: 60,
                                icon: 'blurIcon',
                                propertyName: 'shadow.blurRadius',
                              },
                              {
                                type: 'numberField',
                                id: 'shadowStyleRow-spreadRadius',
                                label: 'Spread',
                                hideLabel: true,
                                width: 60,
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
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                    .addCollapsiblePanel({
                      id: 'containerStyleCollapsiblePanel',
                      propertyName: 'pnlContainerStyle',
                      label: 'Container',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: 'styleRouter',
                      collapsible: 'header',
                      content: {
                        id: 'containerStylePnl',
                        components: [...new DesignerToolbarSettings()
                          .addCollapsiblePanel({
                            id: 'containerDimensionsStyleCollapsiblePanel',
                            propertyName: 'pnlDimensions',
                            label: 'Dimensions',
                            parentId: 'containerStylePnl',
                            labelAlign: 'right',
                            collapsible: 'header',
                            content: {
                              id: 'container-dimensionsStylePnl',
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInputRow({
                                  id: 'dimensionsStyleRowWidth',
                                  parentId: 'container-dimensionsStylePnl',
                                  inline: true,
                                  hidden: { _code: 'return getSettingValue(data?.filesLayout) === "vertical";', _mode: 'code', _value: false } as any,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: 'width-s4gmBg31azZC0UjZjpfTm',
                                      label: "Width",
                                      width: 85,
                                      propertyName: "container.dimensions.width",
                                      icon: "widthIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                    },
                                    {
                                      type: 'textField',
                                      id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                      label: "Min Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minWidth",
                                      icon: "minWidthIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
                                      label: "Max Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxWidth",
                                      icon: "maxWidthIcon",
                                    }
                                  ]
                                })
                                .addSettingsInputRow({
                                  id: 'dimensionsStyleRowHeight',
                                  parentId: 'container-dimensionsStylePnl',
                                  inline: true,
                                  hidden: { _code: 'return getSettingValue(data?.filesLayout) === "horizontal";', _mode: 'code', _value: false } as any,
                                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: 'height-s4gmBg31azZC0UjZjpfTm',
                                      label: "Height",
                                      width: 85,
                                      propertyName: "container.dimensions.height",
                                      icon: "heightIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                    },
                                    {
                                      type: 'textField',
                                      id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                      label: "Min Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minHeight",
                                      icon: "minHeightIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
                                      label: "Max Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxHeight",
                                      icon: "maxHeightIcon",
                                    }
                                  ]
                                })
                                .toJson()
                              ]
                            }
                          })
                          .addCollapsiblePanel({
                            id: 'styleCollapsiblePanel',
                            propertyName: 'stylingBox',
                            label: 'Margin & Padding',
                            labelAlign: 'right',
                            collapsible: 'header',
                            parentId: 'containerStylePnl',
                            content: {
                              id: 'stylingBoxPnl',
                              components: [
                                ...new DesignerToolbarSettings()
                                  .addStyleBox({
                                    id: 'styleBoxPnl',
                                    label: 'Margin Padding',
                                    hideLabel: true,
                                    propertyName: 'stylingBox',
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
                            parentId: 'containerStylePnl',
                            collapsible: 'header',
                            content: {
                              id: 'containerCustomStylePnl',
                              components: [...new DesignerToolbarSettings()
                                .addSettingsInput({
                                  id: 'custom-css-412c-8461-4c8d55e5c073',
                                  inputType: 'codeEditor',
                                  propertyName: 'container.style',
                                  hideLabel: false,
                                  label: 'Style',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                })
                                .toJson()
                              ]
                            }
                          })
                          .toJson()]
                      }
                    })
                    .toJson()]
              }).toJson()]
          },
          {
            key: '6',
            title: 'Security',
            id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: '6Vw9iiDw9d0MD_Rh5cbIn'
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