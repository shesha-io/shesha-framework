import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const commonStyleRouterId = nanoid();

  const dataSourceTypeOptions = [
    { label: 'Values', value: 'values' },
    { label: 'Reference list', value: 'referenceList' },
    { label: 'API URL', value: 'url' },
  ];

  const directionOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
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
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true } })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Data', (fb) => fb
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data Source Type', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions })
                  .addSettingsInputRow({
                    inputs: [{
                      type: 'labelValueEditor', propertyName: 'items', label: 'Items',
                      labelTitle: 'Label', labelName: 'label', valueTitle: 'Value', valueName: 'value',
                      mode: 'dialog', jsSetting: true, valueEditor: 'expression',
                    }],
                    // An unset data source renders as `values`, so the Items editor stays visible for it.
                    visibleJs: 'return (getSettingValue(data?.dataSourceType) ?? "values") === "values";',
                  })
                  .addSettingsInputRow({
                    inputs: [{ type: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', jsSetting: true }],
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "referenceList";',
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'codeEditor', propertyName: 'dataSourceUrl', label: 'Data Source URL', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'reducerFunc', label: 'Reducer Function', jsSetting: true },
                    ],
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "url";',
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'textField', propertyName: 'validate.message', label: 'Message', size: 'small', jsSetting: true },
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validator', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
                    ],
                  }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.string).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addPropertyRouter({ id: commonStyleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                  propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                  components: [
                    ...fbf(commonStyleRouterId)
                      .addSettingsInput({ inputType: 'dropdown', propertyName: 'direction', label: 'Direction', size: 'small', jsSetting: true, dropdownOptions: directionOptions })
                      .stdFontPanel(undefined, 'font', ['align'])
                      .stdDimensionsPanel('dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow')
                      .stdMarginPaddingPanel('stylingBoxJson')
                      .stdCustomStylePanel(undefined, 'style')
                      .stdCollapsiblePanel('Radio Style', (f) => f
                        .stdDimensionsPanel('radio.dimensions')
                        .stdBorderPanel(removeStyleRouter !== true, 'radio.border')
                        .stdBackgroundPanel(removeStyleRouter !== true, 'radio.background')
                        .stdShadowPanel('radio.shadow')
                        .stdMarginPaddingPanel('radio.stylingBoxJson')
                        .stdCustomStylePanel(undefined, 'radio.style'),
                      true,
                      )
                      .toJson()],
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
