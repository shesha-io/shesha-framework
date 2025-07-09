import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import {
  backgroundTypeOptions,
  positionOptions,
  repeatOptions,
  sizeOptions,
} from '@/designer-components/_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '@/designer-components/_settings/utils/border/utils';
import { buttonTypes } from '@/designer-components/button/util';
import { fontTypes, fontWeights } from '@/designer-components/_settings/utils/font/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
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
                  label: 'Component name',
                  labelAlign: 'right',
                  parentId: commonTabId,
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'label',
                  label: 'Label',
                  labelAlign: 'right',
                  parentId: commonTabId,
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'tooltip',
                  inputType: 'textArea',
                  label: 'Tooltip',
                  labelAlign: 'right',
                  parentId: commonTabId,
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'iconPicker',
                  propertyName: 'icon',
                  label: 'Icon',
                  labelAlign: 'right',
                  defaultValue: 'FilterOutlined',
                  parentId: commonTabId,
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'hidden',
                      parentId: commonTabId,
                      label: 'Hide',
                      labelAlign: 'right',
                      type: 'switch',
                      jsSetting: true,
                    },
                    {
                      id: nanoid(),
                      type: 'editModeSelector',
                      propertyName: 'editMode',
                      parentId: commonTabId,
                      label: 'Edit Mode',
                      labelAlign: 'right',
                      jsSetting: true,
                    },
                  ],
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
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'buttonType',
                        label: 'Type',
                        defaultValue: 'link',
                        validate: {
                          required: true,
                        },
                        inputType: 'dropdown',
                        dropdownOptions: buttonTypes,
                        parentId: styleRouterId,
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
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                propertyName: 'font',
                                inputs: [
                                  {
                                    type: 'dropdown',
                                    id: nanoid(),
                                    label: 'Family',
                                    propertyName: 'font.type',
                                    hideLabel: true,
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data.label);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
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
                                    hidden: {
                                      _code:
                                        'return !getSettingValue(data.label);',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
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
                        id: nanoid(),
                        propertyName: 'pnlDimensions',
                        label: 'Dimensions',
                        parentId: styleRouterId,
                        labelAlign: 'right',
                        ghost: true,
                        collapsible: 'header',
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
                        hidden: {
                          _code:
                            'return ["text", "link", "ghost", "dashed"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addContainer({
                                id: nanoid(),
                                parentId: styleRouterId,
                                components: getBorderInputs() as any,
                              })
                              .addContainer({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                        parentId: styleRouterId,
                        collapsible: 'header',
                        hidden: {
                          _code:
                            'return ["text", "link", "ghost", "primary"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
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
                                buttonGroupOptions: backgroundTypeOptions,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";',
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
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";',
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
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                              })
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: styleRouterId,
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
                                id: nanoid(),
                                parentId: styleRouterId,
                                inline: true,
                                hidden: {
                                  _code:
                                    'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                inputs: [
                                  {
                                    type: 'customDropdown',
                                    id: nanoid(),
                                    label: 'Size',
                                    customTooltip:
                                      'Size of the background image, two space separated values with units e.g "100% 100px"',
                                    hideLabel: true,
                                    propertyName: 'background.size',
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
                        id: nanoid(),
                        propertyName: 'pnlShadowStyle',
                        label: 'Shadow',
                        labelAlign: 'right',
                        ghost: true,
                        hidden: {
                          _code:
                            'return ["text", "link", "ghost"].includes(getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.buttonType));',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        parentId: styleRouterId,
                        collapsible: 'header',
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
                        parentId: styleRouterId,
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
                                parentId: styleRouterId,
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
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  jsSetting: true,
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
