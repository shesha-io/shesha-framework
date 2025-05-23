import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { IEntityReferenceControlProps } from './entityReference';
import {
  backgroundTypeOptions,
  positionOptions,
  repeatOptions,
  sizeOptions,
} from '../_settings/utils/background/utils';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';

export const getSettings = (data: IEntityReferenceControlProps) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const dataTabId = nanoid();
  const securityId = nanoid();
  const styleRouterId = nanoid();
  const propertyNameId = nanoid();
  const hiddenId = nanoid();

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
                .addContextPropertyAutocomplete({
                  id: propertyNameId,
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                  styledLabel: true,
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
                      id: `placeholder-${commonTabId}`,
                      propertyName: 'placeholder',
                      label: 'Placeholder',
                      size: 'small',
                      jsSetting: true,
                    },
                    {
                      type: 'textArea',
                      id: `tooltip-${commonTabId}`,
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
                      id: nanoid(),
                      propertyName: 'displayType',
                      label: 'Display Type',
                      type: 'dropdown',
                      allowClear: true,
                      size: 'small',
                      jsSetting: true,
                      dropdownOptions: [
                        { value: 'displayProperty', label: 'Display property' },
                        { value: 'icon', label: 'Icon' },
                        { value: 'textTitle', label: 'Text title' },
                      ],
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      parentId: commonTabId,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'iconName',
                      label: 'Icon',
                      parentId: commonTabId,
                      type: 'iconPicker',
                      jsSetting: true,
                      allowClear: true,
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      hidden: {
                        _code: 'return getSettingValue(data?.displayType) !== "icon";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'textTitle',
                      label: 'Text Title',
                      parentId: commonTabId,
                      type: 'textField',
                      jsSetting: true,
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      hidden: {
                        _code: 'return getSettingValue(data?.displayType) !== "textTitle";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                  ],
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: hiddenId,
                  propertyName: 'hidden',
                  parentId: commonTabId,
                  label: 'Hide',
                  jsSetting: true,
                  layout: 'horizontal',
                })
                .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'autocomplete',
                  allowClear: true,
                  propertyName: 'entityType',
                  label: 'Entity Type',
                  description: 'The entity type you want to use for the chart.',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  hidden: false,
                  dataSourceType: 'url',
                  validate: { required: true },
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  settingsValidationErrors: [],
                  useRawValues: true,
                  width: '100%',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'autocomplete',
                  allowClear: true,
                  propertyName: 'getEntityUrl',
                  label: 'Get Entity URL',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  hidden: false,
                  dataSourceType: 'url',
                  validate: { required: true },
                  dataSourceUrl: '/api/services/app/Api/Endpoints',
                  settingsValidationErrors: [],
                  useRawValues: true,
                  width: '100%',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  hidden: {
                    _code: 'return getSettingValue(data?.displayType) !== "displayProperty";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'displayProperty',
                      label: 'Display Property',
                      parentId: dataTabId,
                      type: 'propertyAutocomplete',
                      allowClear: true,
                      jsSetting: true,
                      width: '100%',
                      modelType: {
                        _code: 'return getSettingValue(data?.entityType);',
                        _mode: 'code',
                        _value: false
                      } as any,
                      autoFillProps: false,
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'entityReferenceType',
                  label: 'Entity Reference Type',
                  parentId: dataTabId,
                  inputType: 'dropdown',
                  allowClear: true,
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'Quickview', label: 'Quickview' },
                    { value: 'NavigateLink', label: 'Navigate link' },
                    { value: 'Dialog', label: 'Dialog' },
                  ],
                  defaultValue: 'Quickview',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      propertyName: 'formSelectionMode',
                      label: 'Form Selection Mode',
                      parentId: dataTabId,
                      type: 'dropdown',
                      allowClear: true,
                      jsSetting: true,
                      dropdownOptions: [
                        { value: 'name', label: 'Name' },
                        { value: 'dynamic', label: 'Dynamic' },
                      ],
                      defaultValue: 'name',
                    },
                    {
                      id: nanoid(),
                      propertyName: 'formType',
                      label: 'Form Type',
                      parentId: dataTabId,
                      type: 'formTypeAutocomplete',
                      jsSetting: true,
                      width: '100%',
                      allowClear: true,
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      hidden: {
                        _code: 'return getSettingValue(data?.formSelectionMode) !== "dynamic";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                    {
                      id: nanoid(),
                      propertyName: 'formIdentifier',
                      label: 'Form Identifier',
                      parentId: dataTabId,
                      type: 'formAutocomplete',
                      jsSetting: true,
                      allowClear: true,
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      hidden: {
                        _code: 'return getSettingValue(data?.formSelectionMode) !== "name";',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    },
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'pnlDialogSettings',
                  label: 'Dialog Settings',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSectionSeparator({
                        id: nanoid(),
                        parentId: dataTabId,
                        label: 'Dialog Settings',
                        labelAlign: 'left',
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        hidden: {
                          _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'modalTitle',
                            label: 'Modal Title',
                            parentId: dataTabId,
                            type: 'textField',
                            jsSetting: true,
                          },
                          {
                            id: nanoid(),
                            propertyName: 'footerButtons',
                            label: 'Footer Buttons',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: 'default', label: 'Default' },
                              { value: 'custom', label: 'Custom' },
                              { value: 'none', label: 'None' },
                            ],
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'buttons',
                            label: 'Configure Modal Buttons',
                            parentId: dataTabId,
                            type: 'buttonGroupConfigurator',
                            hidden: {
                              _code: 'return getSettingValue(data?.footerButtons) !== "custom";',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            jsSetting: true,
                          },
                          {
                            id: nanoid(),
                            propertyName: 'submitHttpVerb',
                            label: 'Submit HTTP Verb',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              { value: 'POST', label: 'POST' },
                              { value: 'PUT', label: 'PUT' },
                            ],
                            defaultValue: 'POST',
                            hidden: {
                              _code: 'return getSettingValue(data?.footerButtons) === "default";',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: appearanceTabId,
                        readOnly: {
                          _code: 'return getSettingValue(data?.readOnly);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        hidden: {
                          _code: 'return getSettingValue(data?.entityReferenceType) !== "Dialog";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'additionalProperties',
                            label: 'Additional Properties',
                            parentId: dataTabId,
                            jsSetting: true,
                            type: 'labelValueEditor',
                            labelTitle: 'Key',
                            valueTitle: 'Value',
                            labelName: 'key',
                            valueName: 'value',
                            tooltip:
                              'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                              'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                              'Id initial value is already initialised with {{entityReference.id}} but you can override it',
                            exposedVariables: [
                              { name: 'data', description: 'This form data', type: 'object' },
                              { name: 'form', description: 'Form instance', type: 'object' },
                              {
                                name: 'formMode',
                                description: 'Current form mode',
                                type: "'designer' | 'edit' | 'readonly'",
                              },
                              { name: 'globalState', description: 'Global state', type: 'object' },
                              {
                                name: 'entityReference.id',
                                description: 'Id of entity reference entity',
                                type: 'object',
                              },
                              { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                              { name: 'moment', description: 'moment', type: '' },
                              { name: 'http', description: 'axiosHttp', type: '' },
                            ].map((item) => JSON.stringify(item)),
                          },
                          {
                            id: nanoid(),
                            propertyName: 'modalWidth',
                            label: 'Dialog Width (%)',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: '40%', label: 'Small' },
                              { value: '60%', label: 'Medium' },
                              { value: '80%', label: 'Large' },
                              { value: 'custom', label: 'Custom' },
                            ],
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        hidden: {
                          _code: 'return getSettingValue(data?.modalWidth) !== "custom";',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'widthUnits',
                            label: 'Width Units',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            jsSetting: true,
                            dropdownOptions: [
                              { value: '%', label: 'Percentage (%)' },
                              { value: 'px', label: 'Pixels (px)' },
                            ],
                            width: '100%',
                          },
                          {
                            id: nanoid(),
                            propertyName: 'customWidth',
                            label: 'Custom Width',
                            parentId: dataTabId,
                            type: 'textField',
                            jsSetting: true,
                            min: 0,
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'handleSuccess',
                            label: 'Handle Success',
                            parentId: dataTabId,
                            type: 'switch',
                            defaultValue: true,
                            jsSetting: true,
                            width: '100%',
                          },
                        ],
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlOnSuccess',
                        label: 'On Success Handler',
                        labelAlign: 'left',
                        parentId: dataTabId,
                        collapsible: 'header',
                        ghost: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.handleSuccess) !== true;',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addConfigurableActionConfigurator({
                                id: nanoid(),
                                propertyName: 'onSuccess',
                                label: 'On Success',
                                parentId: dataTabId,
                                jsSetting: true,
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'handleFail',
                            label: 'Handle Fail',
                            parentId: dataTabId,
                            type: 'switch',
                            defaultValue: false,
                            jsSetting: false,
                          },
                        ],
                      })
                      .addCollapsiblePanel({
                        id: nanoid(),
                        propertyName: 'pnlOnFail',
                        label: 'On Fail Handler',
                        labelAlign: 'left',
                        parentId: dataTabId,
                        collapsible: 'header',
                        ghost: true,
                        hidden: {
                          _code: 'return getSettingValue(data?.handleFail) !== true;',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addConfigurableActionConfigurator({
                                id: nanoid(),
                                propertyName: 'onFail',
                                label: 'On Fail',
                                parentId: dataTabId,
                                jsSetting: false,
                              })
                              .toJson(),
                          ],
                        },
                      })
                      .toJson(),
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'pnlQuickviewSettings',
                  label: 'Quickview Settings',
                  labelAlign: 'right',
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.entityReferenceType) !== "Quickview";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSectionSeparator({
                        id: nanoid(),
                        parentId: dataTabId,
                        label: 'Quickview Settings',
                        labelAlign: 'left',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'quickviewWidth',
                        label: 'Quickview Width',
                        parentId: dataTabId,
                        inputType: 'numberField',
                        jsSetting: true,
                        defaultValue: 600,
                        min: 0,
                      })
                      .toJson(),
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
                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                    _value: '',
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
                          components: [
                            ...new DesignerToolbarSettings()
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
                              .toJson(),
                          ],
                        },
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
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowWidth',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'width-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Width',
                                    width: 85,
                                    propertyName: 'dimensions.width',
                                    icon: 'widthIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Min Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minWidth',
                                    icon: 'minWidthIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Max Width',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.maxWidth',
                                    icon: 'maxWidthIcon',
                                  },
                                ],
                              })
                              .addSettingsInputRow({
                                id: 'dimensionsStyleRowHeight',
                                parentId: 'dimensionsStylePnl',
                                inline: true,
                                inputs: [
                                  {
                                    type: 'textField',
                                    id: 'height-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Height',
                                    width: 85,
                                    propertyName: 'dimensions.height',
                                    icon: 'heightIcon',
                                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                                  },
                                  {
                                    type: 'textField',
                                    id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                    label: 'Min Height',
                                    width: 85,
                                    hideLabel: true,
                                    propertyName: 'dimensions.minHeight',
                                    icon: 'minHeightIcon',
                                  },
                                  {
                                    type: 'textField',
                                    id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
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
                                buttonGroupOptions: backgroundTypeOptions,
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
                                hidden: {
                                  _code:
                                    'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
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
                                    customTooltip:
                                      'Size of the background image, two space separated values with units e.g "100% 100px"',
                                    dropdownOptions: sizeOptions,
                                    hidden: {
                                      _code:
                                        'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";',
                                      _mode: 'code',
                                      _value: false,
                                    } as any,
                                  },
                                  {
                                    type: 'customDropdown',
                                    id: 'backgroundStyleRow-position',
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
                                id: 'backgroundStyleRow-repeat',
                                parentId: 'backgroundStyleRow',
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
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-offsetX',
                                    label: 'Offset X',
                                    hideLabel: true,
                                    tooltip: 'Offset X',
                                    width: 80,
                                    icon: 'offsetHorizontalIcon',
                                    propertyName: 'shadow.offsetX',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-offsetY',
                                    label: 'Offset Y',
                                    hideLabel: true,
                                    tooltip: 'Offset Y',
                                    width: 80,
                                    icon: 'offsetVerticalIcon',
                                    propertyName: 'shadow.offsetY',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-blurRadius',
                                    label: 'Blur',
                                    hideLabel: true,
                                    tooltip: 'Blur Radius',
                                    width: 80,
                                    icon: 'blurIcon',
                                    propertyName: 'shadow.blurRadius',
                                  },
                                  {
                                    type: 'numberField',
                                    id: 'shadowStyleRow-spreadRadius',
                                    label: 'Spread',
                                    hideLabel: true,
                                    tooltip: 'Spread Radius',
                                    width: 80,
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
                        propertyName: 'pnlLayout',
                        label: 'Layout',
                        labelAlign: 'right',
                        ghost: true,
                        parentId: styleRouterId,
                        collapsible: 'header',
                        content: {
                          id: nanoid(),
                          components: [
                            ...new DesignerToolbarSettings()
                              .addSettingsInputRow({
                                id: nanoid(),
                                parentId: 'pnlLayout',
                                readOnly: false,
                                inputs: [
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    propertyName: 'labelCol',
                                    label: 'Label Col',
                                    size: 'small',
                                    jsSetting: true,
                                    min: 0,
                                    max: 24,
                                    defaultValue: 8,
                                  },
                                  {
                                    type: 'numberField',
                                    id: nanoid(),
                                    propertyName: 'wrapperCol',
                                    label: 'Wrapper Col',
                                    size: 'small',
                                    jsSetting: true,
                                    min: 0,
                                    max: 24,
                                    defaultValue: 16,
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
                                readOnly: {
                                  _code: 'return  getSettingValue(data?.readOnly);',
                                  _mode: 'code',
                                  _value: false,
                                } as any,
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'style',
                                parentId: styleRouterId,
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
            key: 'security',
            title: 'Security',
            id: securityId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  size: 'small',
                  parentId: securityId,
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
