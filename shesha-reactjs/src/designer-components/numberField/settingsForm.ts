import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

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
            key: '1', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .stdPropertyLabelInputs()
                .stdPlaceholerDescriptionInputs()
                .stdVisibleEditableInputs()
                .stdPrefixSuffixInputs()
                .stdCollapsiblePanel('Format', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'highPrecision', label: 'High Precision', tooltip: 'To support high precision decimals support' })
                  .addSettingsInput({ inputType: 'numberField', propertyName: 'stepNumeric', label: 'Step', visibleJs: 'return !getSettingValue(data?.highPrecision)' })
                  .addSettingsInput({ inputType: 'textField', propertyName: 'stepString', label: 'Step', visibleJs: 'return getSettingValue(data?.highPrecision)' }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'threeStateSwitch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'numberField', propertyName: 'validate.minValue', label: 'Min Value', size: 'small', jsSetting: true },
                      { type: 'numberField', propertyName: 'validate.maxValue', label: 'Max Value', size: 'small', jsSetting: true },
                    ],
                  }))

                .toJson(),
            ],
          },
          {
            key: '2', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange', 'onFocus', 'onBlur']).toJson()],
          },
          {
            key: '3', title: 'Appearance', id: appearanceTabId,
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle']).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
