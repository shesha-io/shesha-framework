import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  // Generate unique IDs for major components
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const eventsTabId = nanoid();
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
                      type: 'textArea',
                      id: nanoid(),
                      propertyName: 'description',
                      label: 'Tooltip',
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
                      label: 'Edit Mode',
                      size: 'small',
                      jsSetting: true,
                    },
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
                .addCollapsiblePanel({
                  id: nanoid(),
                  propertyName: 'pnlValidation',
                  label: 'Validations',
                  labelAlign: 'right',
                  parentId: commonTabId,
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components: [
                      ...fbf()
                        .addSettingsInput({
                          id: nanoid(),
                          propertyName: 'validate.required',
                          label: 'Required',
                          inputType: 'switch',
                          size: 'small',
                          layout: 'horizontal',
                          jsSetting: true,
                          parentId: commonTabId,
                        })
                        .toJson(),
                    ],
                  },
                })
                .toJson(),
            ],
          },
          {
            key: '2',
            title: 'Data',
            id: dataTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'dropdown',
                  propertyName: 'dataSourceType',
                  label: 'Data Source Type',
                  size: 'small',
                  jsSetting: true,
                  parentId: dataTabId,
                  dropdownOptions: [
                    {
                      label: 'Values',
                      value: 'values',
                    },
                    {
                      label: 'Reference list',
                      value: 'referenceList',
                    },
                    {
                      label: 'API URL',
                      value: 'url',
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "values";',
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'labelValueEditor',
                      propertyName: 'items',
                      parentId: dataTabId,
                      label: 'Items',
                      labelTitle: 'Label',
                      labelName: 'label',
                      valueTitle: 'Value',
                      valueName: 'value',
                      mode: 'dialog',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "referenceList";',
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      type: 'referenceListAutocomplete',
                      id: nanoid(),
                      propertyName: 'referenceListId',
                      label: 'Reference List',
                      jsSetting: true,
                    },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: 'return  getSettingValue(data?.dataSourceType) !== "url";',
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'dataSourceUrl',
                      label: 'Data Source URL',
                      jsSetting: true,
                    },
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'reducerFunc',
                      label: 'Reducer Function',
                      jsSetting: true,
                    },
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: '3',
            title: 'Events',
            id: eventsTabId,
            components: [
              ...fbf()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onChangeCustom',
                  label: 'On Change',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on changing of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onFocusCustom',
                  label: 'On Focus',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on focus of event.',
                  parentId: eventsTabId,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'codeEditor',
                  propertyName: 'onBlurCustom',
                  label: 'On Blur',
                  labelAlign: 'right',
                  tooltip: 'Enter custom eventhandler on blur of event.',
                  parentId: eventsTabId,
                })
                .toJson(),
            ],
          },
          {
            key: '4',
            title: 'Appearance',
            id: appearanceTabId,
            components: [
              ...fbf(appearanceTabId)
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'dropdown',
                  propertyName: 'direction',
                  label: 'Direction',
                  size: 'small',
                  jsSetting: true,
                  parentId: appearanceTabId,
                  dropdownOptions: [
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                  ],
                })
                .stdAppearancePanels(
                  ['font', 'dimensions', 'border', 'background', 'shadow', 'marginPadding', 'customStyle'],
                  removeStyleRouter,
                )
                .toJson(),
            ],
          },
          {
            key: '5',
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
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
