
import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/es/form/Form';

export const getSettings = () => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();

  return {
    components: new DesignerToolbarSettings()
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
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'hidden',
                      label: 'Hidden',
                      description: 'If enabled, the layer will be hidden',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'allowChangeVisibility',
                      label: 'Allow Change Visibility',
                      description: 'If enabled, the user can change the visibility of the layer'
                    }
                  ]
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: nanoid(),
                  parentId: commonTabId,
                  propertyName: 'showLegend',
                  label: 'Show Legend',
                  description: 'If enabled, the legend will be shown',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'textField',
                      id: nanoid(),
                      propertyName: 'label',
                      label: 'Name',
                      jsSetting: false,
                      hidden: {
                        _code: 'return getSettingValue(data?.showLegend) !== true',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      validate: {
                        required: true,
                      },
                    }
                  ]
                })
                .toJson()
            ]

          },
          {
            key: '2',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataSource',
                  parentId: dataTabId,
                  label: 'Data Source',
                  jsSetting: false,
                  inputType: 'dropdown',
                  dropdownOptions: [
                    { label: 'Entity', value: 'entity' },
                    { label: 'URL', value: 'custom' },
                  ],
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'autocomplete',
                      propertyName: 'entityType',
                      label: 'Entity Type',
                      labelAlign: 'right',
                      parentId: dataTabId,
                      hidden: {
                        _code: 'return getSettingValue(data?.dataSource) !== "entity"',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      dataSourceType: 'url',
                      validate: {},
                      jsSetting: true,
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      useRawValues: true
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      type: 'queryBuilder',
                      id: nanoid(),
                      propertyName: 'filters',
                      label: 'Entity Filter',
                      modelType: '{{data.entityType}}',
                      hidden: {
                        _code: 'return getSettingValue(data?.dataSource) !== "entity"',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      type: 'endpointsAutocomplete',
                      id: nanoid(),
                      propertyName: 'customUrl',
                      label: 'Endpoint',
                      hidden: {
                        _code: 'return getSettingValue(data?.dataSource) !== "custom"',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: false,
                    }
                  ]
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'title',
                  parentId: dataTabId,
                  label: 'Event Name',
                  inputType: 'textArea',
                  jsSetting: true,
                  validate: {
                    required: true,
                  },
                  description:
                    'Make sure that all dynamic properties used here are part of the property list. Accepts {{mustache}} syntax',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      type: 'propertyAutocomplete',
                      id: nanoid(),
                      propertyName: 'startTime',
                      label: 'Event Start Time',
                      mode: 'single',
                      description: 'Property that will be used to show when the event starts',
                      validate: { required: true },
                      modelType: '{{data.entityType}}',
                      autoFillProps: false,
                      jsSetting: false,
                    },
                    {
                      type: 'propertyAutocomplete',
                      id: nanoid(),
                      propertyName: 'endTime',
                      label: 'Event End Time',
                      mode: 'single',
                      description: 'Property that will be used to show when the event ends',
                      validate: { required: true },
                      modelType: '{{data.entityType}}',
                      autoFillProps: false,
                      jsSetting: false,
                    }
                  ]
                })
                .addSettingsInput({
                  inputType: 'switch',
                  id: nanoid(),
                  propertyName: 'overfetch',
                  label: 'Avoid Overfetching',
                  parentId: dataTabId,
                  description: 'If enabled, the layer will not overfetch the data and will allow you to specify the properties to fetch',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  inputs: [
                    {
                      type: 'propertyAutocomplete',
                      id: nanoid(),
                      propertyName: 'propertyList',
                      label: 'Additional Fields To Fetch',
                      mode: 'multiple',
                      description: 'List of all the properties you want to fetch',
                      validate: { required: true },
                      modelType: '{{data.entityType}}',
                      autoFillProps: false,
                      hidden: {
                        _code: 'return getSettingValue(data?.overfetch) !== true',
                        _mode: 'code',
                        _value: false,
                      } as any,
                    }
                  ]
                })
                .toJson()
            ]
          },
          {
            key: '3',
            title: 'Appearance',
            id: nanoid(),
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: nanoid(),
                  inputs: [
                    {
                      type: 'colorPicker',
                      id: nanoid(),
                      propertyName: 'color',
                      label: 'Event Color',
                      allowClear: true,
                      jsSetting: true,
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'showIcon',
                      label: 'Show Icon',
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: nanoid(),
                  inputs: [
                    {
                      type: 'codeEditor',
                      id: nanoid(),
                      propertyName: 'icon',
                      label: 'Pick Icon',
                      hidden: {
                        _code: "return getSettingValue(data?.showIcon) !== true",
                        _mode: "code",
                        _value: false
                      } as any,
                      description: 'Set the icon of your nodes',
                      exposedVariables: [
                        {
                          id: nanoid(),
                          name: 'item',
                          description: 'Active node',
                          type: 'object',
                        },
                        {
                          id: nanoid(),
                          name: 'data',
                          description: 'Form data',
                          type: 'object',
                        },
                        {
                          id: nanoid(),
                          name: 'globalState',
                          description: 'The global state',
                          type: 'object',
                        },
                      ],
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: nanoid(),
                  inputs: [
                    {
                      type: 'colorPicker',
                      id: nanoid(),
                      propertyName: 'iconColor',
                      label: 'Icon Color',
                      allowClear: true,
                      jsSetting: true,
                      hidden: {
                        _code: "return getSettingValue(data?.showIcon) !== true",
                        _mode: "code",
                        _value: false
                      } as any,
                    }
                  ]
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: nanoid(),
                  inputs: [
                    {
                      type: 'configurableActionConfigurator',
                      id: nanoid(),
                      propertyName: 'onSelect',
                      label: 'On Select',
                      description: 'Action to be executed when the event is selected',
                      jsSetting: false,
                      hideLabel: true,
                    },
                    {
                      type: 'configurableActionConfigurator',
                      id: nanoid(),
                      propertyName: 'onDblClick',
                      label: 'On Double Click',
                      description: 'Action to be executed when the event is double clicked',
                      jsSetting: false,
                      hideLabel: true,
                    }
                  ]
                })
                .toJson()
            ]
          }
        ]

      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};
