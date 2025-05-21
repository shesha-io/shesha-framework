import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const eventsTabId = nanoid();
  const validationTabId = nanoid();
  const quickviewTabId = nanoid();
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
                propertyName: 'propertyName',
                parentId: commonTabId,
                label: 'Property Name',
                size: 'small',
                validate: {
                  required: true
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
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: 'mode',
                    label: 'Selection Mode',
                    dropdownOptions: [
                      { label: 'single', value: 'single' },
                      { label: 'multiple', value: 'multiple' },
                    ],
                    jsSetting: true,
                  },
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'disableSearch',
                    label: 'Disable Search',
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
                  },
                ],
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'defaultValue',
                label: 'Default Value',
                labelAlign: 'right',
                tooltip: 'Enter default value for component. Multiple values are exposed.',
                parentId: dataTabId,
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'getDefaultValue'
                },
                availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard("shesha:selectedRow").build();'
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'dataSourceType',
                label: 'Data Source Type',
                parentId: dataTabId,
                dropdownOptions: [
                  { label: 'Entities List', value: 'entitiesList' },
                  { label: 'Url', value: 'url' },
                ],
                onChangeCustom: 'if (value === "url" && data?.valueFormat === "entityReference") form.setFieldValue("valueFormat", "simple");',
                jsSetting: true,
              })
              .addContainer({
                id: nanoid(),
                propertyName: 'urlContainer',
                parentId: dataTabId,
                hidden: { 
                  _code: 'return getSettingValue(data?.dataSourceType) !== "url";',
                  _mode: 'code',
                  _value: false 
                },
                components: [...new DesignerToolbarSettings()
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'labelValueEditor',
                    propertyName: 'queryParams',
                    label: 'Query Param',
                    labelTitle: 'Param',
                    labelName: 'param',
                    valueTitle: 'Value',
                    valueName: 'value',
                    parentId: 'urlContainer',
                    ignorePrefixesOnNewItems: true,
                  })
                  .addPropertyAutocomplete({
                    id: nanoid(),
                    propertyName: 'keyPropName',
                    label: 'Key Property Name',
                    parentId: 'urlContainer',
                    modelType: '{{data.entityType}}',
                    autoFillProps: false,
                    hidden: {
                      _code: 'return getSettingValue(data?.valueFormat) === "entityReference";',
                      _mode: 'code',
                      _value: false
                    },
                  })
                  .toJson()]
              })
              .addContainer({
                id: nanoid(),
                propertyName: 'entitiesContainer',
                parentId: dataTabId,
                hidden: { 
                  _code: 'return getSettingValue(data?.dataSourceType) !== "entitiesList";',
                  _mode: 'code',
                  _value: false 
                },
                components: [...new DesignerToolbarSettings()
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'autocomplete',
                    propertyName: 'entityType',
                    label: 'Entity Type',
                    parentId: 'entitiesContainer',
                    dataSourceType: 'url',
                    dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                    useRawValues: true,
                    jsSetting: true,
                  })
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'queryBuilder',
                    propertyName: 'filter',
                    label: 'Entity Filter',
                    parentId: 'entitiesContainer',
                    hidden: {
                      _code: 'return !getSettingValue(data?.entityType);',
                      _mode: 'code',
                      _value: false
                    },
                    modelType: '{{data.entityType}}',
                    fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                  })
                  .addPropertyAutocomplete({
                    id: nanoid(),
                    propertyName: 'displayPropName',
                    label: 'Display Property',
                    parentId: 'entitiesContainer',
                    modelType: '{{data.entityType}}',
                    autoFillProps: false,
                    description: 'Name of the property that should be displayed in the autocomplete. Leave empty to use default display property defined on the back-end.',
                  })
                  .addPropertyAutocomplete({
                    id: nanoid(),
                    propertyName: 'fields',
                    label: 'Fields to fetch',
                    parentId: 'entitiesContainer',
                    mode: 'multiple',
                    modelType: '{{data.entityType}}',
                  })
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'dataSortingEditor',
                    propertyName: 'sorting',
                    componentName: 'standardSorting',
                    label: 'Sort By',
                    parentId: 'entitiesContainer',
                    modelType: '{{data.entityType}}',
                  })
                  .addSettingsInput({
                    id: nanoid(),
                    inputType: 'dataSortingEditor',
                    propertyName: 'grouping',
                    componentName: 'grouping',
                    label: 'Grouping',
                    parentId: 'entitiesContainer',
                    maxItemsCount: 1,
                    modelType: '{{data.entityType}}',
                  })
                  .toJson()]
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'endpointsAutocomplete',
                propertyName: 'dataSourceUrl',
                label: "",
                parentId: dataTabId,
                prefix: 'GET',
                mode: 'url',
                httpVerb: 'get',
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'dropdown',
                propertyName: 'valueFormat',
                label: 'Value Format',
                parentId: dataTabId,
                dropdownOptions: { 
                  _code: 'return getSettingValue(data?.dataSourceType) === "entitiesList" ? [{\"label\": \"Simple Id\",\"value\": \"simple\",\"id\": \"1\"},{\"label\": \"Entity reference\",\"value\": \"entityReference\",\"id\": \"2\"},{\"label\": \"Custom\",\"value\": \"custom\",\"id\": \"3\"}] : [{\"label\": \"Simple Id\",\"value\": \"simple\",\"id\": \"1\"},{\"label\": \"Custom\",\"value\": \"custom\",\"id\": \"3\"}];', 
                  _mode: 'code', 
                  _value: false 
                } as any,
                //dataSourceType: 'values',
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: { 
                  _code: 'return getSettingValue(data?.valueFormat) !== "custom";', 
                  _mode: 'code', 
                  _value: false 
                },
                inputs: [
                  {
                    type: 'codeEditor',
                    id: nanoid(),
                    propertyName: 'outcomeValueFunc',
                    label: 'Value Function',
                    description: 'Return value for item object',
                    wrapInTemplate: true,
                    templateSettings: { 
                      functionName: 'outcomeValueFunc'
                    },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();'
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: { 
                  _code: 'return getSettingValue(data?.valueFormat) !== "custom";', 
                  _mode: 'code', 
                  _value: false 
                },
                inputs: [
                  {
                    type: 'codeEditor',
                    id: nanoid(),
                    propertyName: 'keyValueFunc',
                    label: 'Key Value Function',
                    description: 'Return key from selected value',
                    wrapInTemplate: true,
                    templateSettings: { 
                      functionName: 'keyValueFunc'
                    },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of item").build();'
                  },
                ],
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'displayValueFunc',
                label: 'Display Value Function',
                parentId: dataTabId,
                description: 'Return display value for item\'s object',
                wrapInTemplate: true,
                templateSettings: { 
                  functionName: 'displayValueFunc'
                },
                availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();'
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: { 
                  _code: 'return getSettingValue(data?.valueFormat) !== "custom";', 
                  _mode: 'code', 
                  _value: false 
                },
                inputs: [
                  {
                    type: 'codeEditor',
                    id: nanoid(),
                    propertyName: 'filterKeysFunc',
                    label: 'Filter Selected Function',
                    description: 'Return filter object (JsonLogic) for selected value(s). Use this settings to configure non-standard values format',
                    wrapInTemplate: true,
                    templateSettings: { 
                      functionName: 'filterSelectedFunc'
                    },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of autocomplete").build();'
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                hidden: {
                  _code: 'return getSettingValue(data?.valueFormat) !== "simple";', 
                  _mode: 'code', 
                  _value: false
                },
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'allowFreeText',
                    label: 'Allow Free Text',
                    description: 'Allow to use free text that is missing on the source',
                    jsSetting: true,
                  },
                ],
              })
              .toJson()
            ]
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
                tooltip: 'Enter custom eventhandler on changing of event. (form, value, option) are exposed. Called when select an option or input value change',
                parentId: eventsTabId,
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onChange'
                },
                availableConstantsExpression: 'return metadataBuilder.object("constants").addAllStandard().addObject("value", "Component current value").addObject("option", "Meta data of component current value").build();'
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onFocusCustom',
                label: 'On Focus',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on focus of event.',
                parentId: eventsTabId,
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onFocus'
                },
              })
              .addSettingsInput({
                id: nanoid(),
                inputType: 'codeEditor',
                propertyName: 'onBlurCustom',
                label: 'On Blur',
                labelAlign: 'right',
                tooltip: 'Enter custom eventhandler on blur of event.',
                parentId: eventsTabId,
                wrapInTemplate: true,
                templateSettings: {
                  functionName: 'onBlur'
                },
              })
              .toJson()
            ]
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
              .addSettingsInputRow({
                id: nanoid(),
                parentId: validationTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'validate.minLength',
                    label: 'Min Length',
                    size: 'small',
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'validate.maxLength',
                    label: 'Max Length',
                    size: 'small',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: validationTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'validate.message',
                    label: 'Message',
                    jsSetting: true,
                  },
                  {
                    type: 'codeEditor',
                    id: nanoid(),
                    propertyName: 'validate.validator',
                    label: 'Validator',
                    tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise',
                    wrapInTemplate: true,
                    templateSettings: {
                      functionName: 'validator'
                    },
                  },
                ],
              })
              .toJson()
            ]
          },
          {
            key: 'quickview',
            title: 'Quickview',
            id: quickviewTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'quickviewEnabled',
                label: 'Use Quickview',
                parentId: quickviewTabId,
                jsSetting: false,
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: quickviewTabId,
                hidden: {
                  _code: 'return !getSettingValue(data?.quickviewEnabled);',
                  _mode: 'code',
                  _value: false
                },
                inputs: [
                  {
                    type: 'formAutocomplete',
                    id: nanoid(),
                    propertyName: 'quickviewFormPath',
                    label: 'Form Path',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: quickviewTabId,
                hidden: {
                  _code: 'return !getSettingValue(data?.quickviewEnabled);',
                  _mode: 'code',
                  _value: false
                },
                inputs: [
                  {
                    type: 'endpointsAutocomplete',
                    id: nanoid(),
                    propertyName: 'quickviewGetEntityUrl',
                    label: 'Get Entity Url',
                    prefix: 'GET',
                    mode: 'url',
                    httpVerb: 'get',
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: quickviewTabId,
                hidden: {
                  _code: 'return !getSettingValue(data?.quickviewEnabled);',
                  _mode: 'code',
                  _value: false
                },
                inputs: [
                  {
                    type: 'propertyAutocomplete',
                    id: nanoid(),
                    propertyName: 'quickviewDisplayPropertyName',
                    label: 'Display Property Name',
                    modelType: '{{data.entityType}}',
                    autoFillProps: false,
                  },
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'quickviewWidth',
                    label: 'Width',
                    jsSetting: true,
                  },
                ],
              })
              .toJson()
            ]
          },
         
                    {
                        key: '7',
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
                                    _value: ""
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
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
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
                                                    .toJson()
                                                ]
                                            }
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
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "dimensions.width",
                                                                icon: "widthIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

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
                                                            }
                                                        ]
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
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
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
                                                            }
                                                        ]
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBorderStyle',
                                            label: 'Border',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()

                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        components: getCornerInputs() as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBackgroundStyle',
                                            label: 'Background',
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
                                                            parentId: styleRouterId,
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
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
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'multiColorPicker',
                                                                id: nanoid(),
                                                                propertyName: "background.gradient.colors",
                                                                label: "Colors",
                                                                jsSetting: false,
                                                            }
                                                            ],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            hideLabel: true,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
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
                                                            parentId: styleRouterId,
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
                                                            parentId: styleRouterId,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'textField',
                                                                    id: nanoid(),
                                                                    jsSetting: false,
                                                                    propertyName: "background.storedFile.id",
                                                                    label: "File ID"
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
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
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
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
                                                        .toJson()
                                                ],
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
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
                                                    .toJson()
                                                ]
                                            }
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
                                                components: [...new DesignerToolbarSettings()
                                                    .addStyleBox({
                                                        id: nanoid(),
                                                        label: 'Margin Padding',
                                                        hideLabel: true,
                                                        propertyName: 'stylingBox',
                                                    })
                                                    .toJson()
                                                ]
                                            }
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
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
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
            key: '',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addPermissionAutocomplete({
                id: nanoid(),
                propertyName: 'permissions',
                label: 'Permissions',
                parentId: securityTabId,
                jsSetting: true,
              })
              .toJson()
            ]
          },
        ]
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};