import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', size: 'small', validate: { required: true }, styledLabel: true })
              .addSettingsInputRow({ inputs: [
                { type: 'codeEditor', propertyName: 'disableRefresh', label: 'Disable Refresh Data', tooltip: "Return 'true' if dataContext is not ready to refresh data (filter data is not ready, etc...)",
                  availableConstantsExpression: ' return metadataBuilder.object("constants").addAllStandard().build();', language: 'typescript',
                },
                { type: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true },
              ] })
              .addSectionSeparator({ label: 'Data Source Settings', containerStylingBoxJson: { _type: 'styleBox', marginTop: '8px', marginBottom: '16px' } })
              .addSettingsInput({ propertyName: 'sourceType', label: 'Data Source Type', inputType: 'dropdown', allowClear: true, validate: { required: true }, jsSetting: true,
                dropdownOptions: [{ label: 'URL', value: 'Url' }, { label: 'Entity', value: 'Entity' }, { label: 'Form', value: 'Form' }],
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data.sourceType) === 'Entity';", labelAlign: 'right', jsSetting: true, width: '100%',
                inputType: 'entityTypeAutocomplete', propertyName: 'entityType', label: 'Entity Type', description: 'The entity type you want to use.',
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data.sourceType) === 'Url' || getSettingValue(data.sourceType) === 'Entity';",
                inputType: 'endpointsAutocomplete', propertyName: 'endpoint', label: 'Custom Endpoint', labelAlign: 'right', description: 'The endpoint to use to fetch data.',
                validate: { required: { _code: "return getSettingValue(data.sourceType) === 'Url';", _mode: 'code', _value: false } as unknown as boolean },
                jsSetting: true, width: '100%',
              })
              .addSettingsInputRow({ inline: false, inputs: [
                { type: 'dropdown', propertyName: 'dataFetchingMode', label: 'Data Fetching Mode', labelAlign: 'right', allowClear: true,
                  dropdownOptions: [{ label: 'Paging', value: 'paging' }, { label: 'Fetch all', value: 'fetchAll' }], validate: { required: true }, jsSetting: true,
                },
                { propertyName: 'defaultPageSize', label: 'Default Page Size', type: 'dropdown', allowClear: true,
                  visibleJs: "return getSettingValue(data.dataFetchingMode) === 'paging';", validate: { required: true }, jsSetting: true,
                  dropdownOptions: [{ label: '5', value: `5` }, { label: '10', value: `10` }, { label: '20', value: `20` }, { label: '30', value: `30` }, { label: '50', value: `50` }, { label: '100', value: `100` }, { label: '200', value: `200` }],
                },
              ],
              })
              .addSettingsInput({ visibleJs: "const sourceType = getSettingValue(data && data.sourceType); const entityType = getSettingValue(data && data.entityType); return sourceType === 'Entity' && Boolean(entityType);",
                propertyName: 'permanentFilter', label: 'Permanent Filter', labelAlign: 'right', inputType: 'queryBuilder', modelType: { _code: 'return getSettingValue(data?.entityType);', _mode: 'code', _value: undefined },
                fieldsUnavailableHint: 'Please select `Entity Type` to be able to configure this filter.', jsSetting: false, width: '100%',
              })
              .addSettingsInput({ visibleJs: "return !(!getSettingValue(data?.sourceType) || getSettingValue(data.sourceType) === 'Url' || getSettingValue(data.sourceType) === 'Form');",
                propertyName: 'sortMode', label: 'Sort Mode', labelAlign: 'right', inputType: 'dropdown', allowClear: true,
                dropdownOptions: [{ label: 'Standard', value: 'standard' }, { label: 'Strict', value: 'strict' }], validate: { required: true }, jsSetting: true, width: '100%',
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data.sortMode) === 'strict';",
                validate: { required: { _code: "return getSettingValue(data.sortMode) === 'strict';", _mode: 'code' } },
                propertyName: 'strictSortBy', componentName: 'strictSortBy', label: 'Order By', labelAlign: 'right', inputType: 'propertyAutocomplete',
                description: 'The properties you want to order the data by. Use the propeties that you have selected for axis, value (and legend).',
                modelType: { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' }, autoFillProps: false, jsSetting: true,
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data.sortMode) === 'strict';",
                propertyName: 'strictSortOrder', componentName: 'strictSortOrder', label: 'Sort Order', labelAlign: 'right', inputType: 'dropdown', allowClear: true,
                validate: { required: { _code: "return getSettingValue(data.sortMode) === 'strict';", _mode: 'code', _value: false } },
                dropdownOptions: [{ label: 'Ascending', value: 'asc' }, { label: 'Descending', value: 'desc' }], width: '100%', jsSetting: true,
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data.sortMode) === 'standard' && getSettingValue(data.sourceType) !== 'Url' && getSettingValue(data.sourceType) !== 'Form';",
                inputType: 'dataSortingEditor', propertyName: 'standardSorting', componentName: 'standardSorting', label: 'Sort By', labelAlign: 'right', isDynamic: false,
                modelType: { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' } as unknown as string, jsSetting: true,
              })
              .addSettingsInput({ visibleJs: "return (getSettingValue(data && data.sourceType) === 'Entity' && getSettingValue(data.sortMode) !== 'strict');",
                inputType: 'dataSortingEditor', propertyName: 'grouping', componentName: 'grouping', label: 'Grouping', labelAlign: 'right', isDynamic: false,
                jsSetting: true, modelType: { _code: 'return getSettingValue(data?.entityType);', _mode: 'code' } as unknown as string,
              })
              .addSettingsInput({ visibleJs: "return (getSettingValue(data.sourceType) === 'Entity' && getSettingValue(data.sortMode) === 'strict' || getSettingValue(data.sourceType) === 'Form');",
                propertyName: 'allowReordering', inputType: 'dropdown', label: 'Allow Reordering', allowClear: true, isDynamic: false,
                dropdownOptions: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Inherit', value: 'inherit' }], width: '100%', validate: { required: true }, jsSetting: true,
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data?.allowReordering) === 'yes';", description: 'The endpoint to use to reorder data (if not provided, the default endpoint will be used).',
                propertyName: 'customReorderEndpoint', label: 'Custom Reorder Endpoint', labelAlign: 'right', inputType: 'endpointsAutocomplete', jsSetting: true,
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data?.allowReordering) === 'yes';", description: 'Action to execute before row reorder. Can be used for validation and cancellation.',
                propertyName: 'onBeforeRowReorder', label: 'On Before Row Reorder', inputType: 'configurableActionConfigurator',
              })
              .addSettingsInput({ visibleJs: "return getSettingValue(data?.allowReordering) === 'yes';", description: 'Action to execute after row reorder. Receives the API response data.',
                propertyName: 'onAfterRowReorder', label: 'On After Row Reorder', inputType: 'configurableActionConfigurator',
              })
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: {
      isSettingsForm: true,
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
