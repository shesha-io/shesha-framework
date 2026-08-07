import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ADDRESS_EVENTS } from './events';

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
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .stdPlaceholderDescriptionInputs()
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Search', (fb) => fb
                  .addSettingsInputRow({
                    inputs: [
                      {
                        type: 'numberField', propertyName: 'minCharactersSearch', label: 'Min Characters Before Search', size: 'small', jsSetting: true,
                        tooltip: 'The minimum characters required before an api call can be made.',
                      },
                      {
                        type: 'numberField', propertyName: 'debounce', label: 'Debounce (MS)', size: 'small', jsSetting: true,
                        tooltip: 'Debouncing prevents extra activations/inputs from triggering too often. This is the time in milliseconds the call will be delayed by.',
                      },
                    ],
                  })
                  .addSettingsInputRow({
                    inputs: [
                      {
                        type: 'dropdown', propertyName: 'countryRestriction', label: 'Country Restriction', size: 'small', jsSetting: true,
                        tooltip: 'A filter which is based on the country/countries, multiple countries can be selected.',
                        showSearch: true, dropdownMode: 'multiple', allowClear: true, dropdownOptions: COUNTRY_CODES,
                      },
                      {
                        type: 'textField', propertyName: 'prefix', label: 'Prefix (Area Restriction)', size: 'small', jsSetting: true,
                        tooltip: 'A simple prefix which is appended in the search but not the input search field, often used to create a biased search in address.',
                      },
                    ],
                  }))
                .stdCollapsiblePanel('API Keys', (fb) => fb
                  .addSettingsInput({
                    inputType: 'Password', propertyName: 'googleMapsApiKey', label: 'Google Maps Key', size: 'small', jsSetting: true,
                    tooltip: 'API key for authorization. Google Maps key which is required to make successful calls to Google services.',
                  })
                  .addSettingsInput({
                    inputType: 'Password', propertyName: 'openCageApiKey', label: 'OpenCage Key', size: 'small', jsSetting: true,
                    tooltip: 'API key for authorization. Go to (https://opencagedata.com/api) to learn about OpenCage. OpenCage key which is required to make successful calls to OpenCage services.',
                  }))
                .stdCollapsiblePanel('Priority Bounds', (fb) => fb
                  .addSettingsInput({
                    inputType: 'switch', propertyName: 'showPriorityBounds', label: 'Priority Bounds (Advanced)', size: 'small', layout: 'horizontal', jsSetting: true,
                    tooltip: 'Advanced search options, not required if a search priority is not needed. Note this will be discarded unless all values are provided.',
                  })
                  .addSettingsInputRow({
                    inputs: [
                      {
                        type: 'numberField', propertyName: 'latPriority', label: 'Latitude (Priority Bound)', size: 'small', jsSetting: true,
                        tooltip: 'Latitude value which the search will be prioritized from.', validate: { required: true },
                      },
                      {
                        type: 'numberField', propertyName: 'lngPriority', label: 'Longitude (Priority Bound)', size: 'small', jsSetting: true,
                        tooltip: 'Longitude value which the search will be prioritized from.', validate: { required: true },
                      },
                    ],
                    visibleJs: 'return getSettingValue(data?.showPriorityBounds) === true;',
                  })
                  .addSettingsInputRow({
                    inputs: [
                      {
                        type: 'numberField', propertyName: 'radiusPriority', label: 'Radius (Priority Bound)', size: 'small', jsSetting: true,
                        tooltip: 'The radius in which the latitude and longitude will be priorities from.', validate: { required: true },
                      },
                    ],
                    visibleJs: 'return getSettingValue(data?.showPriorityBounds) === true;',
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
            components: [
              ...fbf(eventsTabId)
                .stdEventHandlers([...ADDRESS_EVENTS], DataTypes.string)
                .stdEventHandler(
                  'onSelectCustom',
                  'On Select',
                  'Enter the event handling code when an address is selected from the suggestions',
                  'return metadataBuilder.object("constants")\r\n .addAllStandard()\r\n .addString("value", "Component current value")\r\n .addObject("event", "The selected address, with its coordinates and (when an OpenCage key is configured) the geocoding details", undefined)\r\n .build();',
                )
                .toJson(),
            ],
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
