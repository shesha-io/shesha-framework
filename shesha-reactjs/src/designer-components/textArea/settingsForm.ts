import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
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
            key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true } })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Behaviour', (fb) => fb
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'switch', propertyName: 'autoSize', label: 'Auto Size', jsSetting: true },
                      { type: 'switch', propertyName: 'allowClear', label: 'Allow Clear', jsSetting: true },
                    ],
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'switch', propertyName: 'showCount', label: 'Show Chars Count', jsSetting: true },
                      { type: 'switch', propertyName: 'spellCheck', label: 'Spell Check', jsSetting: true },
                    ],
                  }))
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'numberField', propertyName: 'validate.minLength', label: 'Min Length', size: 'small', jsSetting: true },
                      { type: 'numberField', propertyName: 'validate.maxLength', label: 'Max Length', size: 'small', jsSetting: true },
                    ],
                  })
                  .addSettingsInputRow({
                    inputs: [
                      { type: 'codeEditor', propertyName: 'validate.validator', label: 'Custom Validation', labelAlign: 'right', tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise' },
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
            components: [...fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
