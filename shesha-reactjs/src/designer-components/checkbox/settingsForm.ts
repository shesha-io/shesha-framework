import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { fontWeightsOptions } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { FormMarkupWithSettings } from '@/interfaces';

export const getSettings = (data: object): FormMarkupWithSettings => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
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
                .addLabelConfigurator({
                  id: nanoid(),
                  propertyName: 'hideLabel',
                  label: 'Label',
                  parentId: commonTabId,
                  hideLabel: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Tooltip',
                      jsSetting: true,
                    },
                  ],
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
                      defaultValue: 'inherited',
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
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Validation',
            id: validationTabId,
            components: [
              ...new DesignerToolbarSettings()
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
            key: '3',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onChangeCustom',
                  label: 'On Change',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on changing of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onFocusCustom',
                  label: 'On Focus',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on focus of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onBlurCustom',
                  label: 'On Blur',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on blur of event.',
                  parentId: eventsTabId,
                })
                .toJson(),
            ],
          },
          {
            key: 'appearance',
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
                  _value: "",
                },
                components: [
                  ...new DesignerToolbarSettings()
                    .addSettingsInput({
                      id: nanoid(),
                      parentId: styleRouterId,
                      propertyName: 'enableStyleOnReadonly',
                      label: 'Enable Style On Readonly',
                      tooltip: 'Removes all visual styling except typography when the component becomes read-only',
                      inputType: 'switch',
                      jsSetting: true,
                    })
                    .addCollapsiblePanel({
                      id: nanoid(),
                      propertyName: 'pnlFontStyle',
                      label: 'Check Mark',
                      labelAlign: 'right',
                      parentId: styleRouterId,
                      ghost: true,
                      collapsible: 'header',
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: nanoid(),
                            inline: true,
                            propertyName: 'font',
                            inputs: [
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: nanoid(),
                            inline: true,
                            label: 'Width',
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
                            parentId: nanoid(),
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addContainer({
                            id: nanoid(),
                            parentId: nanoid(),
                            components: getBorderInputs() as any,
                          })
                          .addContainer({
                            id: nanoid(),
                            parentId: nanoid(),
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [
                          ...new DesignerToolbarSettings()
                            .addSettingsInput({
                              id: nanoid(),
                              parentId: nanoid(),
                              label: "Type",
                              jsSetting: false,
                              propertyName: "background.type",
                              inputType: "radio",
                              tooltip: "Select a type of background",
                              buttonGroupOptions: backgroundTypeOptions,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: nanoid(),
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
                              parentId: nanoid(),
                              inputs: [{
                                type: 'multiColorPicker',
                                id: nanoid(),
                                propertyName: "background.gradient.colors",
                                label: "Colors",
                                jsSetting: false,
                              },
                              ],
                              hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                              hideLabel: true,
                            })
                            .addSettingsInputRow({
                              id: nanoid(),
                              parentId: nanoid(),
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
                              parentId: nanoid(),
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
                              parentId: nanoid(),
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
                              parentId: nanoid(),
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
                              parentId: nanoid(),
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
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInputRow({
                            id: nanoid(),
                            parentId: nanoid(),
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
                      id: nanoid(),
                      propertyName: 'stylingBox',
                      label: 'Margin & Padding',
                      labelAlign: 'right',
                      ghost: true,
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
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
                      propertyName: 'customStyle',
                      label: 'Custom Styles',
                      labelAlign: 'right',
                      ghost: true,
                      hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                      parentId: styleRouterId,
                      collapsible: 'header',
                      content: {
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                          .addSettingsInput({
                            id: nanoid(),
                            inputType: 'codeEditor',
                            propertyName: 'style',
                            label: 'Style',
                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                          })
                          .toJson(),
                        ],
                      },
                    })
                    .toJson()],
              }).toJson()],
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
