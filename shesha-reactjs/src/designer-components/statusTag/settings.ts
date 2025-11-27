import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const securityTabId = nanoid();

  return {
    components: fbf()
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
            key: '1',
            title: 'Common',
            id: commonTabId,
            components: [
              ...fbf()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  label: 'Property Name',
                  parentId: commonTabId,
                  styledLabel: true,
                  size: 'small',
                  validate: {
                    required: true,
                  },
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
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hide',
                      jsSetting: true,
                      layout: 'horizontal',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'dropdown',
                  propertyName: 'valueSource',
                  parentId: commonTabId,
                  label: 'Value Source',
                  size: 'small',
                  jsSetting: true,
                  dropdownOptions: [
                    { value: 'form', label: 'Form' },
                    { value: 'manual', label: 'Manual' },
                  ],
                  validate: { required: true },
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textField',
                  propertyName: 'override',
                  parentId: commonTabId,
                  label: 'Override',
                  size: 'small',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: {
                    _code: 'return getSettingValue(data?.valueSource) !== "manual";',
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'textField',
                      propertyName: 'value',
                      label: 'Value',
                      size: 'small',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInput(
                  {
                    inputType: 'codeEditor',
                    id: nanoid(),
                    propertyName: 'mappings',
                    label: 'Default Mappings',
                    parentId: commonTabId,
                    hideLabel: false,
                    description: 'Enter the JSON object that should match the structure of the default one provided',
                    language: 'json',
                    wrapInTemplate: false,
                  },
                )
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textField',
                  propertyName: 'color',
                  parentId: appearanceTabId,
                  label: 'Color',
                  size: 'small',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'style',
                  parentId: appearanceTabId,
                  label: 'Style',
                  mode: 'dialog',
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Security',
            id: securityTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
                  jsSetting: true,
                  size: 'small',
                  parentId: securityTabId,
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical',
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
