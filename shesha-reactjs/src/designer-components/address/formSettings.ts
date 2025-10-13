import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { IAddressCompomentProps } from './models';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';
import { EXPOSED_VARIABLES } from './utils';
import { positionOptions, repeatOptions, sizeOptions, backgroundTypeOptions } from '../_settings/utils/background/utils';
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';


import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';


import { FormMarkupWithSettings } from '@/interfaces';
export const getSettings = (data: IAddressCompomentProps): FormMarkupWithSettings => {
  // Generate unique IDs for tabs structure
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const securityTabId = nanoid();
  const styleRouterId = nanoid();
  const appearanceTabId = nanoid();

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
            components: [...new DesignerToolbarSettings()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: "propertyName",
                parentId: commonTabId,
                label: "Property Name",
                size: "small",
                validate: {
                  required: true,
                },
                styledLabel: true,
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
                    id: nanoid(),
                    type: 'textField',
                    propertyName: 'placeholder',
                    label: 'Placeholder',
                    parentId: commonTabId,
                    jsSetting: true,
                  },
                  {
                    id: nanoid(),
                    type: 'textArea',
                    propertyName: 'description',
                    label: 'Tooltip',
                    parentId: commonTabId,
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
                    defaultValue: 'inherited',
                    label: 'Edit Mode',
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'hidden',
                    label: 'Hide',
                    jsSetting: true,
                  },
                ],
              })
              .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'minCharactersSearch',
                    label: 'Min Characters Before Search',
                    tooltip: 'The minimum characters required before an api call can be made.',
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'debounce',
                    label: 'Debounce (MS)',
                    tooltip: 'Debouncing prevents extra activations/inputs from triggering too often. This is the time in milliseconds the call will be delayed by.',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'Password',
                propertyName: 'googleMapsApiKey',
                label: 'Google Maps Key',
                parentId: dataTabId,
                jsSetting: true,
                tooltip: 'API key for authorization. Google Maps key which is required to make successful calls to Google services.',
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'Password',
                propertyName: 'openCageApiKey',
                label: 'OpenCage Key',
                parentId: dataTabId,
                tooltip: 'API key for authorization. Go to (https://opencagedata.com/api) to learn about OpenCage. OpenCage key which is required to make successful calls to OpenCage services.',
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: 'countryRestriction',
                    label: 'Country Restriction',
                    tooltip: 'A filter which is based on the country/countries, multiple countries can be selected.',
                    jsSetting: true,
                    showSearch: true,
                    dropdownMode: 'multiple',
                    allowClear: true,
                    dropdownOptions: COUNTRY_CODES,
                  },
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'prefix',
                    label: 'Prefix (Area Restriction)',
                    tooltip: 'A simple prefix which is appended in the search but not the input search field, often used to create a biased search in address.',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'showPriorityBounds',
                label: 'Priority Bounds (Advanced)',
                tooltip: 'Advanced search options, not required if a search priority is not needed. Note this will be discarded unless all values are provided.',
                parentId: dataTabId,
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: { _code: 'return !getSettingValue(data?.showPriorityBounds);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'latPriority',
                    label: 'Latitude (Priority Bound)',
                    tooltip: 'Latitude value which the search will be prioritized from.',
                    jsSetting: true,
                    validate: {
                      required: true,
                    },
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'lngPriority',
                    label: 'Longitude (Priority Bound)',
                    tooltip: 'Longitude value which the search will be prioritized from.',
                    jsSetting: true,
                    validate: {
                      required: true,
                    },
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: { _code: 'return !getSettingValue(data?.showPriorityBounds);', _mode: 'code', _value: false } as any,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'radiusPriority',
                    label: 'Radius (Priority Bound)',
                    tooltip: 'The radius in which the latitude and longitude will be priorities from.',
                    jsSetting: true,
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
            key: 'validation',
            title: 'Validation',
            id: validationTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'validate.required',
                label: 'Required',
                parentId: validationTabId,
                jsSetting: true,
              })
              .toJson(),
            ],
          },
          {
            key: 'events',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onChangeCustom',
                label: 'On Change',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on changing of event.',
                parentId: eventsTabId,
                exposedVariables: EXPOSED_VARIABLES,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onSelectCustom',
                label: 'On Select',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on selection of address.',
                parentId: eventsTabId,
                exposedVariables: EXPOSED_VARIABLES,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onFocusCustom',
                label: 'On Focus',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on focusing of event.',
                parentId: eventsTabId,
                exposedVariables: EXPOSED_VARIABLES,
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
                      label: 'Font',
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
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                tooltip: 'Enter a list of permissions that should be associated with this component',
                size: 'small',
                parentId: securityTabId,
                jsSetting: true,
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
