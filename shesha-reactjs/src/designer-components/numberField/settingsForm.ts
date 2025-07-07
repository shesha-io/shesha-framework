import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { INumberFieldComponentProps } from './interfaces';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import {
  backgroundTypeOptions,
  positionOptions,
  repeatOptions,
  sizeOptions,
} from '../_settings/utils/background/utils';
import { nanoid } from '@/utils/uuid';

export const getSettings = (data: INumberFieldComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

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
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'placeholder',
                      label: 'Placeholder',
                      size: 'small',
                      jsSetting: true,
                    },
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
                      jsSetting: true,
                      defaultValue: 'inherited',
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'prefix',
                      label: 'Prefix',
                      jsSetting: true,
                    },
                    {
                      type: 'iconPicker',
                      id: nanoid(),
                      propertyName: 'prefixIcon',
                      label: 'Prefix Icon',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'suffix',
                      label: 'Suffix',
                      jsSetting: true,
                    },
                    {
                      type: 'iconPicker',
                      id: nanoid(),
                      propertyName: 'suffixIcon',
                      label: 'Suffix Icon',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'switch',
                  propertyName: 'highPrecision',
                  label: 'High Precision',
                  tooltip: 'To support high precision decimals support',
                  version: 2,
                  defaultValue: false,
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.highPrecision)',
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'numberField',
                      propertyName: 'stepNumeric',
                      parentId: nanoid(),
                      label: 'Step',
                      defaultValue: 1,
                      validate: {},
                      settingsValidationErrors: [],
                    },
                  ],
                })

                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: {
                    _code: 'return !getSettingValue(data?.highPrecision)',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'textField',
                      propertyName: 'stepString',
                      parentId: nanoid(),
                      label: 'Step',
                      defaultValue: 0.1,
                      validate: {},
                      settingsValidationErrors: [],
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
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: validationTabId,
                  inputs: [
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'validate.minValue',
                      label: 'Min Value',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'numberField',
                      id: nanoid(),
                      propertyName: 'validate.maxValue',
                      label: 'Max Value',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
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
            key: '4',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addPropertyRouter({
                  id: nanoid(),
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
                        parentId: 'styleRouter',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
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
                                    dropdownOptions: textAlign,
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
                        parentId: 'styleRouter',
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'dimensionsStylePnl',
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
                                parentId: 'dimensionsStylePnl',
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
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInput({
                                id: nanoid(),
                                parentId: 'backgroundStylePnl',
                                label: 'Type',
                                jsSetting: false,
                                propertyName: 'background.type',
                                inputType: 'radio',
                                tooltip: 'Select a type of background',
                                buttonGroupOptions: backgroundTypeOptions,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'backgroundStylePnl',
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
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'backgroundStylePnl',
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
                                parentId: 'backgroundStylePnl',
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
                                parentId: 'backgroundStylePnl',
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
                                    id: nanoid(),
                                    jsSetting: false,
                                    propertyName: 'background.storedFile.id',
                                    label: 'File ID',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'backgroundStyleRow',
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
                                parentId: 'backgroundStyleRow',
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
                        parentId: 'styleRouter',
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'shadowStylePnl',
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
                        ghost: true,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
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
                        parentId: 'styleRouter',
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
