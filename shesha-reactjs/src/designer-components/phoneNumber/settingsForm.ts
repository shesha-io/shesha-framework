import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { IPhoneNumberInputComponentProps } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { backgroundTypeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data: IPhoneNumberInputComponentProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const validationTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();
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
            components: [...new DesignerToolbarSettings()
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
              .addDropdown({
                id: nanoid(),
                propertyName: 'valueFormat',
                label: 'Value Format',
                parentId: commonTabId,
                size: 'small',
                dataSourceType: 'values',
                values: [
                  { id: 'fullNumber', label: 'Full Number (e.g. +27123456789)', value: 'fullNumber' },
                  { id: 'object', label: 'Object {number, dialCode, countryCode}', value: 'object' },
                ],
                jsSetting: false,
                description: 'Choose how the phone number value should be returned',
              })
              .addEditableTagGroupProps({
                id: nanoid(),
                propertyName: 'allowedDialCodes',
                label: 'Allowed Dial Codes',
                parentId: commonTabId,
                description: 'List of allowed dial codes (e.g., +27, +1, +44). Leave empty to allow all countries.',
                jsSetting: true,
              })
              .addCheckbox({
                id: nanoid(),
                propertyName: 'enforceAllowedDialCodes',
                label: 'Enforce Allowed Dial Codes',
                parentId: commonTabId,
                description: 'When enabled, validates that entered phone numbers use only the allowed dial codes',
                jsSetting: true,
              })
              .addTextField({
                id: nanoid(),
                propertyName: 'defaultCountry',
                label: 'Default Country',
                parentId: commonTabId,
                description: 'ISO country code for default country (e.g., us, gb, za). Defaults to "za" if not specified.',
                jsSetting: true,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: commonTabId,
                inputs: [
                  {
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: 'size',
                    label: 'Size',
                    size: 'small',
                    allowClear: true,
                    dropdownOptions: [
                      { label: 'Small', value: 'small' },
                      { label: 'Middle', value: 'middle' },
                      { label: 'Large', value: 'large' },
                    ],
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'allowClear',
                    label: 'Allow Clear',
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
            components: [...new DesignerToolbarSettings()
              .addCheckbox({
                id: nanoid(),
                propertyName: 'validate.required',
                label: 'Required',
                parentId: validationTabId,
                jsSetting: true,
              })
              .addTextArea({
                id: nanoid(),
                propertyName: 'customValidationCode',
                label: 'Custom Validation',
                parentId: validationTabId,
                description: 'Enter custom validation code to be executed',
                jsSetting: false,
              })
              .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Events',
            id: eventsTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onChangeCustom',
                label: 'On Change',
                labelAlign: 'right',
                tooltip: 'Enter custom event handler on changing of value. Exposed variables: value (phone number), phoneValue (raw input object)',
                parentId: eventsTabId,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onFocusCustom',
                label: 'On Focus',
                labelAlign: 'right',
                tooltip: 'Enter custom event handler when input gains focus. Exposed variables: event (focus event)',
                parentId: eventsTabId,
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onBlurCustom',
                label: 'On Blur',
                labelAlign: 'right',
                tooltip: 'Enter custom event handler when input loses focus. Exposed variables: event (blur event)',
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
            components: [...new DesignerToolbarSettings()
              .addPermissionAutocomplete({
                id: nanoid(),
                propertyName: 'permissions',
                label: 'Permissions',
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
