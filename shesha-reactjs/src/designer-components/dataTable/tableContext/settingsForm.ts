import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";

export const getSettings = (data: any) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const securityTabId = nanoid();

  const dataSettingsId = nanoid();
  const propertyNameId = nanoid();

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
                  id: propertyNameId,
                  propertyName: "propertyName",
                  parentId: commonTabId,
                  label: "Property Name",
                  size: "small",
                  validate: {
                    required: true
                  },
                  styledLabel: true,
                  jsSetting: true,
                  readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                })
                .addSettingsInput({
                  id: nanoid(),
                  inputType: "textField",
                  propertyName: "description",
                  parentId: "root",
                  label: "Description",
                  version: 2,
                })
                .toJson()
            ]
          },
          {
            key: 'security',
            title: 'Security',
            id: securityTabId,
            components: [...new DesignerToolbarSettings()
              .addSettingsInput({
                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                id: nanoid(),
                inputType: 'permissions',
                propertyName: 'permissions',
                label: 'Permissions',
                size: 'small',
                parentId: securityTabId
              })
              .toJson()
            ]
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addCollapsiblePanel({
                  id: dataSettingsId,
                  propertyName: 'dataSettings',
                  parentId: dataTabId,
                  label: 'Data Settings',
                  labelAlign: "left",
                  expandIconPosition: "start",
                  ghost: true,
                  collapsible: 'header',
                  content: {
                    id: nanoid(),
                    components:
                      [...new DesignerToolbarSettings()
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
                          validate: { required: true },
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        })

                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "return getSettingValue(data.sourceType) !== 'Entity';",
                            _mode: "code"
                          } as any,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [{
                            id: nanoid(),
                            type: 'autocomplete',
                            propertyName: 'entityType',
                            label: 'Entity Type',
                            description: 'The entity type you want to use.',
                            labelAlign: 'right',
                            parentId: dataTabId,
                            hidden: false,
                            dataSourceType: 'url',
                            validate: { required: true },
                            dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                            settingsValidationErrors: [],
                            useRawValues: true,
                            width: '100%',
                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          }]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "return getSettingValue(data.sourceType) !== 'Url';",
                            _mode: "code"
                          } as any,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'endpoint',
                              label: 'Custom Endpoint',
                              labelAlign: 'right',
                              parentId: dataTabId,
                              type: 'autocomplete',
                              description: 'The custom endpoint you want to use.',
                              validate: { required: true },
                              dataSourceType: 'url',
                              dataSourceUrl: '/api/services/app/Api/Endpoints',
                              settingsValidationErrors: [],
                              useRawValues: true,
                              width: '100%',
                            }
                          ]
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: "dataFetchingMode",
                          label: "Data fetching mode",
                          labelAlign: "right",
                          parentId: dataTabId,
                          dropdownOptions: [
                            {
                              label: "Paging",
                              value: "paging"
                            },
                            {
                              label: "Fetch all",
                              value: "fetchAll"
                            }
                          ],
                          validate: { required: true },
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: false,
                          hidden: {
                            _value: false,
                            _code: "return getSettingValue(data.dataFetchingMode) !== 'paging';",
                            _mode: "code"
                          } as any,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'defaultPageSize',
                              label: 'Default Page Size',
                              type: 'dropdown',
                              dropdownOptions: [
                                {
                                  label: "5",
                                  value: `5`
                                },
                                {
                                  label: "10",
                                  value: `10`
                                },
                                {
                                  label: "20",
                                  value: `20`
                                },
                                {
                                  label: "30",
                                  value: `30`
                                },
                                {
                                  label: "50",
                                  value: `50`
                                },
                                {
                                  label: "100",
                                  value: `100`
                                },
                                {
                                  label: "200",
                                  value: `200`
                                }
                              ],
                              mode: [
                                "single"
                              ],
                              parentId: dataTabId,
                              validate: { required: true },
                              readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            }
                          ]
                        })
                        .addSettingsInput({
                          id: nanoid(),
                          inputType: 'dropdown',
                          propertyName: "sortMode",
                          label: "Sort Mode",
                          labelAlign: "right",
                          parentId: dataTabId,
                          dropdownOptions: [
                            {
                              label: "Standard",
                              value: "standard"
                            },
                            {
                              label: "Strict",
                              value: "strict"
                            }
                          ],
                          validate: { required: true },
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          settingsValidationErrors: [],
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: "strictSortBy",
                              componentName: "strictSortBy",
                              label: "Order By",
                              labelAlign: "right",
                              parentId: dataTabId,
                              type: 'propertyAutocomplete',
                              isDynamic: false,
                              description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                              validate: { required: false },
                              modelType: '{{data.entityType}}',
                              autoFillProps: false,
                              settingsValidationErrors: [],
                              width: '100%',
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: "strictSortOrder",
                              componentName: "strictSortOrder",
                              label: "Sort Order",
                              labelAlign: "right",
                              type: 'dropdown',
                              inputType: 'dropdown',
                              validate: {
                                required: {
                                  "_code": "return data.sortMode === 'strict';",
                                  "_mode": "code",
                                  "_value": false
                                } as any
                              },
                              dropdownOptions: [
                                {
                                  label: "Ascending",
                                  value: "asc"
                                },
                                {
                                  label: "Descending",
                                  value: "desc"
                                }
                              ],
                              width: '100%',
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "return !getSettingValue(data?.sortMode) || getSettingValue(data.sortMode) !== 'standard';",
                            _mode: "code"
                          },
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: "dataSortingEditor",
                              propertyName: "standardSorting",
                              componentName: "standardSorting",
                              label: "Sort By",
                              labelAlign: "right",
                              parentId: "root",
                              isDynamic: false,
                              version: 0,
                              validate: {},
                              settingsValidationErrors: [],
                              modelType: "{{data.entityType}}",
                              width: '100%',
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "return !getSettingValue(data?.sourceType) || !(getSettingValue(data.sourceType) === 'Entity' && getSettingValue(data.sortMode) === 'strict' || getSettingValue(data.sourceType) === 'Form');",
                            _mode: "code"
                          },
                          isDynamic: false,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              propertyName: 'allowReordering',
                              parentId: dataTabId,
                              type: 'dropdown',
                              label: 'Allow Reordering',
                              inputType: 'dropdown',
                              dropdownOptions: [
                                {
                                  label: "Yes",
                                  value: "yes"
                                },
                                {
                                  label: "No",
                                  value: "no"
                                },
                                {
                                  label: "Inherit",
                                  value: "inherit"
                                }
                              ],
                              width: '100%',
                              validate: { required: true },
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "return !(getSettingValue(data && data.sourceType) === 'Entity' && getSettingValue(data.sortMode) !== 'strict');\n",
                            _mode: "code"
                          } as any,
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                          inputs: [
                            {
                              id: nanoid(),
                              type: "dataSortingEditor",
                              propertyName: "grouping",
                              componentName: "grouping",
                              label: "Grouping",
                              labelAlign: "right",
                              parentId: "root",
                              isDynamic: false,
                              version: 0,
                              validate: {},
                              settingsValidationErrors: [],
                              modelType: "{{data.entityType}}",
                              width: '100%',
                            }
                          ]
                        })
                        .addSettingsInputRow({
                          id: nanoid(),
                          parentId: dataTabId,
                          inline: true,
                          hidden: {
                            _value: false,
                            _code: "const sourceType = getSettingValue(data && data.sourceType);\nconst entityType = getSettingValue(data && data.entityType);\n\nreturn !(sourceType === 'Entity' && Boolean(entityType));",
                            _mode: "code"
                          },
                          readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                            }
                          ]
                        })
                        .toJson()
                      ]
                  }
                })
                .toJson()
            ]
          }
        ]
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  };
};