import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();
  const securityTabId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({
        id: nanoid(),
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
            components: [...fbf()
              .addContextPropertyAutocomplete({
                id: nanoid(),
                propertyName: 'propertyName',
                parentId: commonTabId,
                label: 'Property Name',
                size: 'small',
                validate: { required: true },
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
                    id: nanoid(),
                    type: 'textField',
                    propertyName: 'placeholder',
                    label: 'Placeholder',
                    parentId: commonTabId,
                    jsSetting: true,
                  },
                  {
                    id: nanoid(),
                    type: 'textArea',
                    propertyName: 'description',
                    label: 'Tooltip',
                    parentId: commonTabId,
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
                    defaultValue: 'inherited',
                    label: 'Edit Mode',
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
              .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'Password',
                propertyName: 'googleMapsApiKey',
                label: 'Google Maps API Key',
                parentId: dataTabId,
                jsSetting: true,
                tooltip: 'Google Maps JavaScript API key. Must have the Places and Maps libraries enabled.',
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'switch',
                    id: nanoid(),
                    propertyName: 'enableMapInterface',
                    label: 'Enable Map Interface',
                    tooltip: 'Show a map pin button to open an interactive map dialog for picking a location.',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'latitudePropertyName',
                    label: 'Latitude Property',
                    tooltip: 'Dot-notation path where latitude will be written, e.g. "address.latitude".',
                    jsSetting: true,
                  },
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: 'longitudePropertyName',
                    label: 'Longitude Property',
                    tooltip: 'Dot-notation path where longitude will be written, e.g. "address.longitude".',
                    jsSetting: true,
                  },
                ],
              })
              .addSettingsInputRow({
                id: nanoid(),
                parentId: dataTabId,
                inputs: [
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'defaultZoom',
                    label: 'Default Zoom',
                    tooltip: 'Initial zoom level of the map (1–20). Defaults to 15.',
                    jsSetting: true,
                  },
                  {
                    type: 'numberField',
                    id: nanoid(),
                    propertyName: 'mapHeight',
                    label: 'Map Height (px)',
                    tooltip: 'Height in pixels of the map inside the dialog. Defaults to 400.',
                    jsSetting: true,
                  },
                ],
              })
              .toJson(),
            ],
          },
          {
            key: 'validation',
            title: 'Validation',
            id: validationTabId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'switch',
                propertyName: 'validate.required',
                label: 'Required',
                parentId: validationTabId,
                jsSetting: true,
              })
              .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...fbf()
              .addSettingsInput({
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                tooltip: 'Permissions required to see and interact with this component.',
                size: 'small',
                parentId: securityTabId,
                jsSetting: true,
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
