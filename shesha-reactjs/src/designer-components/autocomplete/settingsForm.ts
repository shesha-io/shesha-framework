import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

const urlVisibleJs = "return getSettingValue(data?.dataSourceType) === 'url';";
const entitiesListVisibleJs = "return getSettingValue(data?.dataSourceType) === 'entitiesList';";
const entityFilterVisibleJs = "return getSettingValue(data?.dataSourceType) === 'entitiesList' && getSettingValue(data?.entityType) !== undefined;";
const customValueFormatVisibleJs = "return getSettingValue(data?.valueFormat) === 'custom';";
const simpleValueFormatVisibleJs = "return getSettingValue(data?.valueFormat) === 'simple';";
const keyPropNameVisibleJs = "return getSettingValue(data?.valueFormat) !== 'entityReference';";
const quickviewVisibleJs = "return getSettingValue(data?.quickviewEnabled) === true && getSettingValue(data?.dataSourceType) !== 'url';";

/* Value Format offers Entity reference only for an entities list; a URL source has no entity to
   reference. Kept as code so switching the data source also corrects an already-saved value. */
const valueFormatOptionsJs = `
if (getSettingValue(data?.dataSourceType) === 'entitiesList') {
    return [
        { "label": "Simple ID", "value": "simple", "id": "1" },
        { "label": "Entity reference", "value": "entityReference", "id": "2" },
        { "label": "Custom", "value": "custom", "id": "3" }
    ];
}
if (getSettingValue(data?.valueFormat) === 'entityReference') {
    setTimeout(() => form.setFieldValue('valueFormat', 'simple'), 0);
}
return [
    { "label": "Simple ID", "value": "simple", "id": "1" },
    { "label": "Custom", "value": "custom", "id": "3" }
];`;

/* For an entities list the display property comes from the selected entity type. For a URL source
   there is no entity type, so the Shesha dynamic CRUD URL (/api/dynamic/{module}/{entity}/Crud/...)
   is parsed to recover one. */
const displayPropModelTypeJs = `
if (getSettingValue(data?.dataSourceType) === 'entitiesList') {
    return getSettingValue(data?.entityType);
}
const url = getSettingValue(data?.dataSourceUrl);
if (!url) {
    // Defer setState to avoid updating during render
    setTimeout(() => form.setFieldValue('displayPropName', undefined), 0);
    return undefined;
}
const dynamicMatch = url.match(/^\\/api\\/dynamic\\/([^\\/]+)\\/([^\\/]+)\\//i);
if (dynamicMatch) {
    return { module: dynamicMatch[1], name: dynamicMatch[2] };
}
// Fallback: explicit entityType if user provided one
return getSettingValue(data?.entityType);`;

const entityTypeModelType = { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' as const };

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const modeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
  ];
  const dataSourceTypeOptions = [
    { value: 'entitiesList', label: 'Entities list' },
    { value: 'url', label: 'URL' },
  ];

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .addSettingsInput({ inputType: 'dropdown', propertyName: 'mode', label: 'Selection Mode', size: 'small', jsSetting: true, dropdownOptions: modeOptions })
                .addSettingsInput({ inputType: 'switch', propertyName: 'disableSearch', label: 'Disable Search', size: 'small', layout: 'horizontal', jsSetting: true })
                .stdCollapsiblePanel('Data', (fb) => fb
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data Source Type', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions })
                  .addSettingsInput({ inputType: 'endpointsAutocomplete', propertyName: 'dataSourceUrl', label: 'Data Source URL', size: 'small', jsSetting: true, mode: 'url', httpVerb: 'get', isDynamic: false, visibleJs: urlVisibleJs })
                  .addSettingsInput({
                    inputType: 'labelValueEditor', propertyName: 'queryParams', label: 'Query Param',
                    labelName: 'param', labelTitle: 'Param', valueName: 'value', valueTitle: 'Value',
                    mode: 'dialog', jsSetting: true, version: 2, visibleJs: urlVisibleJs, valueEditor: 'expression',
                  })
                  .addSettingsInput({ inputType: 'entityTypeAutocomplete', propertyName: 'entityType', label: 'Entity Type', labelAlign: 'right', jsSetting: true, visibleJs: entitiesListVisibleJs })
                  .addSettingsInput({
                    inputType: 'queryBuilder', propertyName: 'filter', label: 'Entity Filter', isDynamic: true, validate: {},
                    modelType: entityTypeModelType,
                    fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                    visibleJs: entityFilterVisibleJs,
                  })
                  .addSettingsInput({ inputType: 'endpointsAutocomplete', propertyName: 'dataSourceUrl', label: 'Custom Source URL', size: 'small', jsSetting: true, mode: 'url', httpVerb: 'get', isDynamic: false, visibleJs: entitiesListVisibleJs })
                  .addSettingsInput({
                    inputType: 'propertyAutocomplete', propertyName: 'displayPropName', label: 'Display Property', size: 'small',
                    tooltip: 'Name of the property that should be displayed in the autocomplete. Leave empty to use default display property defined on the back-end.',
                    modelType: { _code: displayPropModelTypeJs, _mode: 'code' },
                    isDynamic: false, autoFillProps: false,
                  })
                  .addSettingsInput({
                    inputType: 'propertyAutocomplete', propertyName: 'keyPropName', label: 'Key Property Name', size: 'small', jsSetting: true,
                    tooltip: 'Name of the property that will be used as key in the autocomplete. Leave empty to use the default value`s evaluator.',
                    modelType: entityTypeModelType,
                    isDynamic: false, autoFillProps: false,
                    visibleJs: keyPropNameVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'propertyAutocomplete', propertyName: 'fields', label: 'Fields to Fetch', mode: 'multiple',
                    isDynamic: true, jsSetting: true, validate: {},
                    modelType: entityTypeModelType,
                    visibleJs: entitiesListVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'dataSortingEditor', propertyName: 'sorting', label: 'Sort By',
                    isDynamic: true, jsSetting: true, validate: {},
                    modelType: entityTypeModelType,
                    visibleJs: entitiesListVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'dataSortingEditor', propertyName: 'grouping', label: 'Grouping', maxItemsCount: 1,
                    isDynamic: true, jsSetting: true, validate: {},
                    modelType: entityTypeModelType,
                    visibleJs: entitiesListVisibleJs,
                  }))
                .stdCollapsiblePanel('Value', (fb) => fb
                  .addSettingsInput({
                    inputType: 'dropdown', propertyName: 'valueFormat', label: 'Value Format', size: 'small',
                    dropdownOptions: { _code: valueFormatOptionsJs, _mode: 'code' },
                  })
                  .addSettingsInput({
                    inputType: 'codeEditor', propertyName: 'outcomeValueFunc', label: 'Value Function', labelAlign: 'right',
                    tooltip: 'Return value for item object', mode: 'dialog',
                    exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                    wrapInTemplate: true, templateSettings: { functionName: 'outcomeValueFunc' },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();',
                    visibleJs: customValueFormatVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'codeEditor', propertyName: 'keyValueFunc', label: 'Key Value Function', labelAlign: 'right',
                    tooltip: 'Return key from selected value', mode: 'dialog',
                    exposedVariables: [{ name: 'value', description: 'Value of item', type: 'object' }],
                    wrapInTemplate: true, templateSettings: { functionName: 'keyValueFunc' },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of item").build();',
                    visibleJs: customValueFormatVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'codeEditor', propertyName: 'displayValueFunc', label: 'Display Value Function', labelAlign: 'right',
                    tooltip: "Return display value for item's object", mode: 'dialog',
                    exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                    wrapInTemplate: true, templateSettings: { functionName: 'displayValueFunc' },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();',
                  })
                  .addSettingsInput({
                    inputType: 'codeEditor', propertyName: 'filterKeysFunc', label: 'Filter Selected Function', labelAlign: 'right',
                    tooltip: 'Return filter object (JsonLogic) for selected value(s). Use this settings to configure non-standard values format',
                    mode: 'dialog',
                    exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                    wrapInTemplate: true, templateSettings: { functionName: 'filterSelectedFunc' },
                    availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of autocomplete").build();',
                    visibleJs: customValueFormatVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'switch', propertyName: 'allowFreeText', label: 'Allow Free Text', labelAlign: 'right', layout: 'horizontal', jsSetting: true,
                    tooltip: 'Allow to use free text that is missing on the source',
                    visibleJs: simpleValueFormatVisibleJs,
                  }))
                .stdCollapsiblePanel('Quickview', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'quickviewEnabled', label: 'Use Quickview', size: 'small', layout: 'horizontal', jsSetting: true, visibleJs: entitiesListVisibleJs })
                  .addSettingsInput({ inputType: 'formAutocomplete', propertyName: 'quickviewFormPath', label: 'Form Path', size: 'small', validate: { required: false }, visibleJs: quickviewVisibleJs })
                  .addSettingsInput({ inputType: 'endpointsAutocomplete', propertyName: 'quickviewGetEntityUrl', label: 'Get Entity URL', size: 'small', version: 5, visibleJs: quickviewVisibleJs })
                  .addSettingsInput({
                    inputType: 'propertyAutocomplete', propertyName: 'quickviewDisplayPropertyName', label: 'Display Property', size: 'small',
                    tooltip: 'Name of the property that should be displayed in the quickview. Leave empty to use default display property defined on the back-end.',
                    modelType: entityTypeModelType,
                    isDynamic: false, autoFillProps: false,
                    visibleJs: quickviewVisibleJs,
                  })
                  .addSettingsInput({
                    inputType: 'textField', propertyName: 'quickviewWidth', label: 'Width', size: 'small', icon: 'widthIcon', version: 5,
                    tooltip: 'You can use any unit (%, px, em, etc). px by default if without unit',
                    visibleJs: quickviewVisibleJs,
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validation', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.entityReference).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
