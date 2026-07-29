import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

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
            components: [...fbf(eventsTabId).stdEventHandlers(ALL_INPUT_EVENTS, DataTypes.array).toJson()],
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
                .stdAppearancePanels(
                  [{ name: 'font', panelTitle: 'Check Mark', exclude: ['type', 'align'] }, 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'],
                  removeStyleRouter,
                )
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };
};
