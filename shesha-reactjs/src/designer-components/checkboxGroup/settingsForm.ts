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
  ];

  return {
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
                .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Data', (fb) => fb
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'dataSourceType', label: 'Data Source Type', size: 'small', jsSetting: true, dropdownOptions: dataSourceTypeOptions })
                  .addSettingsInputRow({
                    inputs: [{
                      type: 'labelValueEditor', propertyName: 'items', label: 'Items',
                      labelTitle: 'Label', labelName: 'label', valueTitle: 'Value', valueName: 'value',
                      mode: 'dialog', jsSetting: true,
                    }],
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "values";',
                  })
                  .addSettingsInputRow({
                    inputs: [{ type: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', jsSetting: true }],
                    visibleJs: 'return getSettingValue(data?.dataSourceType) === "referenceList";',
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.array).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addSettingsInput({
                  inputType: 'dropdown', propertyName: 'direction', label: 'Direction', size: 'small', jsSetting: true,
                  dropdownOptions: [
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                  ],
                })
                .addPropertyRouter({ id: commonStyleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                  propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                  components: [
                    ...fbf(commonStyleRouterId)
                      .stdFontPanel('font', ['align'])
                      .stdDimensionsPanel('dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow')
                      .stdMarginPaddingPanel('stylingBoxJson')
                      .stdCustomStylePanel('style')
                      .stdCollapsiblePanel('Checkbox Style', (f) => f
                        .stdFontPanel('checkbox.font', ['align', 'type'], 'Check Mark')
                        .stdDimensionsPanel('checkbox.dimensions')
                        .stdBorderPanel(removeStyleRouter !== true, 'checkbox.border', 'radius')
                        .stdBackgroundPanel(removeStyleRouter !== true, 'checkbox.background')
                        .stdShadowPanel('checkbox.shadow')
                        .stdMarginPaddingPanel('checkbox.stylingBoxJson')
                        .stdCustomStylePanel('checkbox.style'),
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
};
