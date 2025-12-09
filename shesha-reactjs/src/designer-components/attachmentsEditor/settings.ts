import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { FormLayout } from 'antd/es/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const styleDimensionsPnlId = nanoid();
  const containerStylePnlId = nanoid();
  const containerDimensionsStylePnlId = nanoid();
  const pnlBorderStyle = nanoid();
  const pnlBackgroundStyle = nanoid();
  const pnlShadowStyleId = nanoid();
  const customStylePnlId = nanoid();
  const pnlFontStyleId = nanoid();
  const downloadedStylesPnlId = nanoid();
  const pnlDownloadedFileFontStylesId = nanoid();

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
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'componentName',
                  label: 'Component name',
                  inputType: 'propertyAutocomplete',
                  validate: { required: true },
                  jsSetting: false,
                })
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  hideLabel: true,
                  label: 'Label',
                  hideLabelPropName: 'hideLabel',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Tooltip',
                      type: 'textArea',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'isDragger',
                      label: 'Is Dragger',
                      type: 'switch',
                      jsSetting: true,
                      description: 'Where the uploader should show a dragger instead of a button',
                      hidden: { _code: 'return getSettingValue(data?.listType) === "thumbnail";', _mode: 'code', _value: false } as any,
                    },
                  ],
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
                      dropdownOptions: [
                        { label: 'File name', value: 'text' },
                        { label: 'Thumbnail', value: 'thumbnail' },
                      ],
                      hidden: { _code: 'return getSettingValue(data?.isDragger);', _mode: 'code', _value: false } as any,
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'hideFileName',
                      label: 'Hide File Name',
                      type: 'switch',
                      jsSetting: true,
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
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
                      propertyName: 'editMode',
                      label: 'Edit Mode',
                      type: 'editModeSelector',
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
                      propertyName: 'allowAdd',
                      label: 'Allow Add',
                      type: 'switch',
                      jsSetting: true,
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'allowDelete',
                      label: 'Allow Remove',
                      type: 'switch',
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
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
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'allowRename',
                      label: 'Allow Rename',
                      type: 'switch',
                      hidden: { _code: 'const r = getSettingValue(data?.readOnly); return r === true || r === "readOnly";', _mode: 'code', _value: false } as any,
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
                      propertyName: 'allowViewHistory',
                      label: 'Allow View History',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'downloadZip',
                      label: 'Download Zip',
                      type: 'switch',
                      jsSetting: true,
                    },
                  ],
                })
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'customActionsPanel',
                  parentId: commonTabId,
                  label: 'Custom',
                  labelAlign: 'left',
                  expandIconPosition: 'start',
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...fbf()
                        .addSettingsInputRow({
                          id: "customActionsPanel",
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'customActions',
                              parentId: 'customActionsPanel',
                              label: 'Custom Actions',
                              type: 'buttonGroupConfigurator',
                              buttonText: 'Customize Actions',
                              buttonTextReadOnly: 'View Actions',
                              title: 'Actions Configuration',
                              description: 'Configure custom actions that appear when hovering over files. Each action should have: id, name, label, icon (optional), tooltip (optional), hidden (optional), and actionConfiguration.',
                              jsSetting: false,
                            },
                            {
                              id: nanoid(),
                              propertyName: 'customContent',
                              parentId: 'customActionsPanel',
                              label: 'Show Custom Content',
                              type: 'switch',
                              description: 'Enable to show custom content below each file.',
                              jsSetting: false,
                            }
                          ]
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: "dropdown",
                          propertyName: "extraFormSelectionMode",
                          parentId: 'customActionsPanel',
                          label: "Form Selection Mode",
                          tooltip: "Choose how to select the form for custom content",
                          dropdownOptions: [
                            { label: "Name", value: "name" },
                            { label: "Dynamic", value: "dynamic" }
                          ],
                          hidden: { _code: 'return !getSettingValue(data?.customContent);', _mode: 'code', _value: false } as any,
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: 'customActionsPanel',
                          inputs: [
                            {
                              id: nanoid(),
                              type: "formTypeAutocomplete",
                              propertyName: "extraFormType",
                              label: "Form Type",
                              jsSetting: true,
                            }
                          ],
                          hidden: { _code: 'return !getSettingValue(data?.customContent) || getSettingValue(data?.extraFormSelectionMode) !== "dynamic";', _mode: 'code', _value: false } as any,
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: 'customActionsPanel',
                          inputs: [
                            {
                              id: nanoid(),
                              type: "formAutocomplete",
                              propertyName: "extraFormId",
                              label: "Form",
                              jsSetting: true
                            }
                          ],
                          hidden: { _code: 'return !getSettingValue(data?.customContent) || getSettingValue(data?.extraFormSelectionMode) === "dynamic";', _mode: 'code', _value: false } as any,
                        })
                        .toJson(),
                    ],
                  },
                })
                .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...fbf()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'ownerName',
                      label: 'Owner',
                      type: 'propertyAutocomplete',
                      autoFillProps: false,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'ownerType',
                      label: 'Owner Type',
                      type: 'entityTypeAutocomplete',
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
                      propertyName: 'ownerId',
                      label: 'Owner ID',
                      type: 'textField',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'filesCategory',
                      label: 'Files Category',
                      type: 'textField',
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
                      propertyName: 'allowedFileTypes',
                      label: 'Allowed File Types',
                      type: 'editableTagGroupProps',
                      description: 'File types that can be accepted.',
                      jsSetting: true,
                      tooltip: "The file typeName should consist a dot before the name, for example .png",
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'validation',
            title: 'Validation',
            id: validationTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'validate.required',
                  label: 'Required',
                  inputType: 'switch',
                  size: 'small',
                  layout: 'horizontal',
                  jsSetting: true,
                  parentId: validationTabId,
                })
                .toJson(),
            ],
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onChangeCustom',
                label: 'On File List Changed',
                labelAlign: 'right',
                parentId: eventsTabId,
                hidden: false,
                description: 'Callback that is triggered when the file is changed.',
                validate: {},
                settingsValidationErrors: [],
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onFileListChanged',
                  useAsyncDeclaration: true,
                },
                availableConstantsExpression: " return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .addString(\"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onDownload',
                label: 'On Download',
                labelAlign: 'right',
                parentId: eventsTabId,
                hidden: false,
                description: 'Callback that is triggered when a file is downloaded.',
                validate: {},
                settingsValidationErrors: [],
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onDownload',
                  useAsyncDeclaration: true,
                },
                availableConstantsExpression: " return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .addString(\"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
              })
              .toJson(),
            ],
          },
          {
            key: 'appearance',
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
                  _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                  _value: "",
                } as any,
                components: [
                  ...fbf()
                    .addSettingsInput({
                      id: nanoid(),
                      inputType: 'switch',
                      propertyName: 'enableStyleOnReadonly',
                      label: 'Enable Style On Readonly',
                      tooltip: 'Removes all visual styling except typography when the component becomes read-only',
                      jsSetting: true,
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlFontStyle',
                      label: 'Font',
                      labelAlign: 'right',
                      parentId: styleRouterId,
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
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlDimensions',
                      label: 'Dimensions',
                      parentId: styleRouterId,
                      labelAlign: 'right',
                      ghost: true,
                      collapsible: 'header',
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: styleDimensionsPnlId,
                        components: [...fbf()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: styleDimensionsPnlId,
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
                            parentId: styleRouterId,
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
                      parentId: styleRouterId,
                      collapsible: 'header',
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: pnlBorderStyle,
                        components: [...fbf()
                          .addContainer({
                            id: nanoid(),
                            parentId: pnlBorderStyle,
                            components: getBorderInputs(fbf),
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: pnlBorderStyle,
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
                      parentId: styleRouterId,
                      collapsible: 'header',
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: pnlBackgroundStyle,
                        components: [
                          ...fbf()
                            .addSettingsInput({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: [
                                {
                                  value: "color",
                                  icon: "FormatPainterOutlined",
                                  title: "Color",
                                },
                                {
                                  value: "gradient",
                                  icon: "BgColorsOutlined",
                                  title: "Gradient",
                                },
                                {
                                  value: "image",
                                  icon: "PictureOutlined",
                                  title: "Image",
                                },
                                {
                                  value: "url",
                                  icon: "LinkOutlined",
                                  title: "URL",
                                },
                                {
                                  value: "storedFile",
                                  icon: "DatabaseOutlined",
                                  title: "Stored File",
                                },
                              ],
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              inputs: [{
                                type: 'colorPicker',
                                id: nanoid(),
                                label: "Color",
                                propertyName: "background.color",
                                hideLabel: true,
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              inputs: [{
                                type: 'multiColorPicker',
                                id: nanoid(),
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              inputs: [{
                                type: 'textField',
                                id: nanoid(),
                                propertyName: "background.url",
                                jsSetting: false,
                                label: "URL",
                              }],
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              inputs: [{
                                type: 'imageUploader',
                                id: nanoid(),
                                propertyName: 'background.uploadFile',
                                label: "Image",
                                jsSetting: false,
                              }],
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
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
                              parentId: pnlBackgroundStyle,
                              inline: true,
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                              inputs: [
                                {
                                  type: 'customDropdown',
                                  id: nanoid(),
                                  label: "Size",
                                  hideLabel: true,
                                  propertyName: "background.size",
                                  customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
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
                                },
                              ],
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: pnlBackgroundStyle,
                              inputs: [{
                                type: 'radio',
                                id: nanoid(),
                                label: 'Repeat',
                                hideLabel: true,
                                propertyName: 'background.repeat',
                                buttonGroupOptions: repeatOptions,
                              }],
                              hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: pnlShadowStyleId,
                        components: [...fbf()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: pnlShadowStyleId,
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
                      hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                      content: {
                        id: customStylePnlId,
                        components: [...fbf()
                          .addSettingsInput({
                            id: nanoid(),
                            parentId: customStylePnlId,
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            hideLabel: false,
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlContainerStyle',
                      label: 'Container Styles',
                      labelAlign: 'right',
                      ghost: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: containerStylePnlId,
                        components: [...fbf()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: containerStylePnlId,
                            inputs: [
                              {
                                id: nanoid(),
                                propertyName: 'filesLayout',
                                label: 'Layout',
                                type: 'dropdown',
                                dropdownOptions: [
                                  { label: 'Vertical', value: 'vertical' },
                                  { label: 'Horizontal', value: 'horizontal' },
                                  { label: 'Grid', value: 'grid' },
                                ],
                                jsSetting: true,
                                hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail" || getSettingValue(data?.isDragger);', _mode: 'code', _value: false } as any,
                              },
                              {
                                id: nanoid(),
                                propertyName: 'gap',
                                label: 'Gap',
                                type: 'numberField',
                                description: 'The gap between the thumbnails.',
                                jsSetting: true,
                                hidden: { _code: 'return getSettingValue(data?.listType) !== "thumbnail";', _mode: 'code', _value: false } as any,
                              },
                            ],
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'containerDimensionsPanel',
                            label: 'Dimensions',
                            parentId: styleRouterId,
                            labelAlign: 'right',
                            ghost: true,
                            collapsible: 'header',
                            content: {
                              id: containerDimensionsStylePnlId,
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: containerDimensionsStylePnlId,
                                  inline: true,
                                  hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.filesLayout) === "vertical";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Width",
                                      width: 85,
                                      propertyName: "container.dimensions.width",
                                      icon: "widthIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minWidth",
                                      icon: "minWidthIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Width",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxWidth",
                                      icon: "maxWidthIcon",
                                    },
                                  ],
                                })
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: styleRouterId,
                                  inline: true,
                                  hidden: { _code: 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.filesLayout) === "horizontal";', _mode: 'code', _value: false } as any,
                                  inputs: [
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Height",
                                      width: 85,
                                      propertyName: "container.dimensions.height",
                                      icon: "heightIcon",
                                      tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Min Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.minHeight",
                                      icon: "minHeightIcon",
                                    },
                                    {
                                      type: 'textField',
                                      id: nanoid(),
                                      label: "Max Height",
                                      width: 85,
                                      hideLabel: true,
                                      propertyName: "container.dimensions.maxHeight",
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
                            propertyName: 'containerStylingBoxPanel',
                            label: 'Margin & Padding',
                            labelAlign: 'right',
                            collapsible: 'header',
                            ghost: true,
                            parentId: styleRouterId,
                            content: {
                              id: 'containerStylingBoxPanel',
                              components: [
                                ...fbf()
                                  .addStyleBox({
                                    id: nanoid(),
                                    label: 'Margin Padding',
                                    hideLabel: true,
                                    propertyName: 'container.stylingBox',
                                    parentId: 'containerStylingBoxPanel',
                                  })
                                  .toJson(),
                              ],
                            },
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'containerCustomStylePanel',
                            label: 'Custom Styles',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: styleRouterId,
                            collapsible: 'header',
                            content: {
                              id: 'containerCustomStylePanel',
                              components: [...fbf()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'container.style',
                                  hideLabel: false,
                                  label: 'Style',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                  parentId: 'containerCustomStylePanel',
                                })
                                .toJson()
                              ]
                            }
                          })
                          .toJson()]
                      }
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlDownloadedStyles',
                      label: 'Downloaded File Styles',
                      labelAlign: 'right',
                      ghost: true,
                      collapsedByDefault: true,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: downloadedStylesPnlId,
                        components: [...fbf()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: downloadedStylesPnlId,
                            inputs: [{
                              type: "switch",
                              id: nanoid(),
                              label: 'Style Downloaded File',
                              propertyName: 'styleDownloadedFiles'
                            },
                            {
                              id: nanoid(),
                              type: 'iconPicker',
                              label: 'Icon',
                              propertyName: 'downloadedIcon',
                              hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } as any,
                            }
                            ]
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlDownloadedFileFontStyles',
                            label: 'Font',
                            labelAlign: 'right',
                            parentId: downloadedStylesPnlId,
                            ghost: true,
                            collapsible: 'header',
                            hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } as any,
                            content: {
                              id: pnlDownloadedFileFontStylesId,
                              components: [...fbf()
                                .addSettingsInputRow({
                                  id: nanoid(),
                                  parentId: pnlDownloadedFileFontStylesId,
                                  inline: true,
                                  propertyName: 'downloadedFileStyles.font',
                                  inputs: [
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Family',
                                      propertyName: 'downloadedFileStyles.font.type',
                                      hideLabel: true,
                                      dropdownOptions: fontTypes,
                                    },
                                    {
                                      type: 'numberField',
                                      id: nanoid(),
                                      label: 'Size',
                                      propertyName: 'downloadedFileStyles.font.size',
                                      hideLabel: true,
                                      width: 50,
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Weight',
                                      propertyName: 'downloadedFileStyles.font.weight',
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
                                      propertyName: 'downloadedFileStyles.font.color',
                                    },
                                    {
                                      type: 'dropdown',
                                      id: nanoid(),
                                      label: 'Align',
                                      propertyName: 'downloadedFileStyles.font.align',
                                      hideLabel: true,
                                      width: 60,
                                      dropdownOptions: textAlignOptions,
                                    }
                                  ],
                                })
                                .toJson()
                              ]
                            }
                          })
                          .addCollapsiblePanel({
                            id: nanoid(),
                            propertyName: 'pnlDownloadedFileCustomStylePanel',
                            label: 'Custom Styles',
                            labelAlign: 'right',
                            ghost: true,
                            parentId: downloadedStylesPnlId,
                            collapsible: 'header',
                            hidden: { _code: 'return !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);', _mode: 'code', _value: false } as any,
                            content: {
                              id: 'pnlDownloadedFileCustomStylePanel',
                              components: [...fbf()
                                .addSettingsInput({
                                  id: nanoid(),
                                  inputType: 'codeEditor',
                                  propertyName: 'downloadedFileStyles.style',
                                  hideLabel: false,
                                  label: 'Style',
                                  description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                  parentId: 'pnlDownloadedFileCustomStylePanel'
                                })
                                .toJson()
                              ]
                            }
                          })
                          .toJson()
                        ]
                      }
                    })
                    .toJson()]
              }).toJson()]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...fbf()
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
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
