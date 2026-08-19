import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
              .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
              .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
              .stdVisibleEditableInputs('full')
              .stdCollapsiblePanel('Reference List', (fb) => fb
                .addSettingsInputRow({
                  inputs: [
                    { type: 'referenceListAutocomplete', propertyName: 'referenceListId', label: 'Reference List', validate: { required: true }, jsSetting: true },
                    { type: 'switch', propertyName: 'showReflistName', label: 'Show Reference List Item Name', size: 'small', jsSetting: true, tooltip: 'When checked the DisplayName/RefList Name will be shown.' },
                  ],
                })
                .addSettingsInputRow({
                  inputs: [
                    { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', size: 'small', jsSetting: true, tooltip: 'When checked the icon will display on the left side of the DisplayName' },
                    { type: 'switch', propertyName: 'solidBackground', label: 'Show Solid Background', size: 'small', jsSetting: true, tooltip: 'When checked the component will show a coloured badge and display within it in white font the icon and/or the selected reference list item label.' },
                  ],
                }))
              .stdCollapsiblePanel('Validations', (fb) => fb
                .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
              .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK], DataTypes.number).toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId).stdAppearancePanels(['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'], removeStyleRouter).toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
