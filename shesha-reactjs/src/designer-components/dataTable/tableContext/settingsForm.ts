import { DesignerToolbarSettings } from '@/index';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const securityTabId = nanoid();

  return {
    components: new DesignerToolbarSettings(data)
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
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addContextPropertyAutocomplete({
                  id: nanoid(),
                  propertyName: 'propertyName',
                  parentId: commonTabId,
                  label: 'Property Name',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  styledLabel: true,
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'textArea',
                  propertyName: 'description',
                  parentId: commonTabId,
                  label: 'Tooltip',
                  jsSetting: true,
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'codeEditor',
                      propertyName: 'disableRefresh',
                      parentId: commonTabId,
                      label: 'Disable Refresh Data',
                      tooltip:
                        "Return 'true' if datatableContext is not ready to refresh data (filter data is not ready, etc...)",
                      readOnly: {
                        _code: 'return getSettingValue(data?.readOnly);',
                        _mode: 'code',
                        _value: false,
                      } as any,
                      jsSetting: true,
                      availableConstantsExpression:
                        '    return metadataBuilder.object("constants").addAllStandard().build();',
                      placeholder: '',
                      language: 'typescript',
                    },
                    {
                      id: nanoid(),
                      type: 'switch',
                      propertyName: 'hidden',
                      parentId: commonTabId,
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
            components: [
              ...new DesignerToolbarSettings()
                .addContainer({
                  id: nanoid(),
                  parentId: dataTabId,
                  labelAlign: 'left',
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'sourceType',
                        parentId: dataTabId,
                        label: 'Data Source Type',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Url', value: 'Url' },
                          { label: 'Entity', value: 'Entity' },
                          { label: 'Form', value: 'Form' },
                        ],
                        allowClear: true,
                        validate: { required: true },
                        jsSetting: true,
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code: "return getSettingValue(data.sourceType) !== 'Entity';",
                          _mode: 'code',
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'autocomplete',
                            propertyName: 'entityType',
                            label: 'Entity Type',
                            description: 'The entity type you want to use.',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            hidden: false,
                            dataSourceType: 'url',
                            validate: {},
                            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                            settingsValidationErrors: [],
                            jsSetting: true,
                            useRawValues: true,
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code:
                            "return getSettingValue(data.sourceType) !== 'Url' && getSettingValue(data.sourceType) !== 'Entity';",
                          _mode: 'code',
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'endpoint',
                            label: 'Custom Endpoint',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'endpointsAutocomplete',
                            description: 'The endpoint to use to fetch data.',
                            validate: {
                              required: {
                                _code: "return getSettingValue(data.sourceType) === 'Url';",
                                _mode: 'code',
                                _value: false,
                              } as any,
                            },
                            dataSourceType: 'url',
                            dataSourceUrl: '/api/services/app/Api/Endpoints',
                            settingsValidationErrors: [],
                            useRawValues: true,
                            jsSetting: true,
                            width: '100%',
                            placeholder: '',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: false,
                        hidden: {
                          _value: false,
                          _code: "return getSettingValue(data.dataFetchingMode) !== 'paging';",
                          _mode: 'code',
                        } as any,
                        readOnly: {
                          _code: 'return getSettingValue(data?.readOnly);',
                          _mode: 'code',
                          _value: false,
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'dropdown',
                            propertyName: 'dataFetchingMode',
                            label: 'Data Fetching Mode',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            allowClear: true,
                            dropdownOptions: [
                              {
                                label: 'Paging',
                                value: 'paging',
                              },
                              {
                                label: 'Fetch all',
                                value: 'fetchAll',
                              },
                            ],
                            validate: { required: true },
                            readOnly: {
                              _code: 'return getSettingValue(data?.readOnly);',
                              _mode: 'code',
                              _value: false,
                            } as any,
                            jsSetting: true,
                          },
                          {
                            id: nanoid(),
                            propertyName: 'defaultPageSize',
                            label: 'Default Page Size',
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              {
                                label: '5',
                                value: `5`,
                              },
                              {
                                label: '10',
                                value: `10`,
                              },
                              {
                                label: '20',
                                value: `20`,
                              },
                              {
                                label: '30',
                                value: `30`,
                              },
                              {
                                label: '50',
                                value: `50`,
                              },
                              {
                                label: '100',
                                value: `100`,
                              },
                              {
                                label: '200',
                                value: `200`,
                              },
                            ],
                            mode: ['single'],
                            parentId: dataTabId,
                            validate: { required: true },
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code:
                            "const sourceType = getSettingValue(data && data.sourceType);\nconst entityType = getSettingValue(data && data.entityType);\n\nreturn !(sourceType === 'Entity' && Boolean(entityType));",
                          _mode: 'code',
                        },
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'permanentFilter',
                            label: 'Permanent Filter',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'queryBuilder',
                            hidden: false,
                            isDynamic: false,
                            validate: {},
                            settingsValidationErrors: [],
                            modelType: '{{data.entityType}}',
                            fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.',
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code:
                            "return !getSettingValue(data?.sourceType) || getSettingValue(data.sourceType) === 'Url' || getSettingValue(data.sourceType) === 'Form';",
                          _mode: 'code',
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'sortMode',
                            label: 'Sort Mode',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              {
                                label: 'Standard',
                                value: 'standard',
                              },
                              {
                                label: 'Strict',
                                value: 'strict',
                              },
                            ],
                            validate: { required: true },
                            settingsValidationErrors: [],
                            jsSetting: true,
                            width: '100%',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code:
                            "return !getSettingValue(data?.sortMode) || getSettingValue(data.sortMode) !== 'strict';",
                          _mode: 'code',
                        } as any,
                        validate: {
                          required: {
                            _code: "return getSettingValue(data.sortMode) === 'strict';",
                            _mode: 'code',
                          } as any,
                        },
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'strictSortBy',
                            componentName: 'strictSortBy',
                            label: 'Order By',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            type: 'propertyAutocomplete',
                            isDynamic: false,
                            description:
                              'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                            validate: { required: false },
                            modelType: '{{data.entityType}}',
                            autoFillProps: false,
                            settingsValidationErrors: [],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code: "return getSettingValue(data.sortMode) !== 'strict';",
                          _mode: 'code',
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'strictSortOrder',
                            componentName: 'strictSortOrder',
                            label: 'Sort Order',
                            labelAlign: 'right',
                            type: 'dropdown',
                            inputType: 'dropdown',
                            allowClear: true,
                            validate: {
                              required: {
                                _code: "return data.sortMode === 'strict';",
                                _mode: 'code',
                                _value: false,
                              } as any,
                            },
                            dropdownOptions: [
                              {
                                label: 'Ascending',
                                value: 'asc',
                              },
                              {
                                label: 'Descending',
                                value: 'desc',
                              },
                            ],
                            width: '100%',
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        hidden: {
                          _value: false,
                          _code:
                            "return !getSettingValue(data?.sortMode) || getSettingValue(data.sortMode) !== 'standard' || getSettingValue(data.sourceType) === 'Url' || getSettingValue(data.sourceType) === 'Form';",
                          _mode: 'code',
                        },
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'dataSortingEditor',
                            propertyName: 'standardSorting',
                            componentName: 'standardSorting',
                            label: 'Sort By',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            hidden: {
                              _value: false,
                              _code:
                                "return !getSettingValue(data?.sortMode) || getSettingValue(data.sortMode) !== 'standard';",
                              _mode: 'code',
                            } as any,
                            customVisibility: null,
                            isDynamic: false,
                            version: 0,
                            modelType: '{{data.entityType}}',
                            validate: {},
                            settingsValidationErrors: [],
                            jsSetting: true,
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        hidden: {
                          _value: false,
                          _code:
                            "return !(getSettingValue(data && data.sourceType) === 'Entity' && getSettingValue(data.sortMode) !== 'strict');",
                          _mode: 'code',
                        } as any,
                        inputs: [
                          {
                            id: nanoid(),
                            type: 'dataSortingEditor',
                            propertyName: 'grouping',
                            componentName: 'grouping',
                            label: 'Grouping',
                            labelAlign: 'right',
                            parentId: 'root',
                            hidden: {
                              _value: false,
                              _code:
                                "return !(getSettingValue(data && data.sourceType) === 'Entity' && getSettingValue(data.sortMode) !== 'strict');\n",
                              _mode: 'code',
                            } as any,
                            isDynamic: false,
                            version: 0,
                            validate: {},
                            settingsValidationErrors: [],
                            jsSetting: true,
                            modelType: '{{data.entityType}}',
                          },
                        ],
                      })
                      .addSettingsInputRow({
                        id: nanoid(),
                        parentId: dataTabId,
                        inline: true,
                        hidden: {
                          _value: false,
                          _code:
                            "return !getSettingValue(data?.sourceType) || !(getSettingValue(data.sourceType) === 'Entity' && getSettingValue(data.sortMode) === 'strict' || getSettingValue(data.sourceType) === 'Form');",
                          _mode: 'code',
                        },
                        isDynamic: false,
                        inputs: [
                          {
                            id: nanoid(),
                            propertyName: 'allowReordering',
                            parentId: dataTabId,
                            type: 'dropdown',
                            label: 'Allow Reordering',
                            inputType: 'dropdown',
                            allowClear: true,
                            dropdownOptions: [
                              {
                                label: 'Yes',
                                value: 'yes',
                              },
                              {
                                label: 'No',
                                value: 'no',
                              },
                              {
                                label: 'Inherit',
                                value: 'inherit',
                              },
                            ],
                            width: '100%',
                            validate: { required: true },
                            jsSetting: true,
                          },
                        ],
                      })
                      .toJson(),
                  ],
                })
                .toJson(),
            ],
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  inputType: 'permissions',
                  propertyName: 'permissions',
                  label: 'Permissions',
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
