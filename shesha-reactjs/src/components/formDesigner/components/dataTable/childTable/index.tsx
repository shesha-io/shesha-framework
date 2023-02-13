import { TableOutlined } from '@ant-design/icons';
import { Alert, Space } from 'antd';
import React, { Fragment, MutableRefObject } from 'react';
import { CollapsiblePanel, GlobalTableFilter, Show, TablePager } from '../../../..';
import { evaluateString, useDataTable, useForm, useGlobalState, useSheshaApplication } from '../../../../..';
import { validateConfigurableComponentSettings } from '../../../../../formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup } from '../../../../../providers/form/models';
import ComponentsContainer from '../../../componentsContainer';
import { IChildTableSettingsProps } from './models';
import ChildDataTableSettings from './settings';
import settingsFormJson from './settingsForm.json';
import { evaluateDynamicFilters, hasDynamicFilter } from '../../../../../providers/dataTable/utils';
import './styles/index.less';
import { ButtonGroup } from '../../button/buttonGroup/buttonGroupComponent';
import camelCaseKeys from 'camelcase-keys';
import _, { isEmpty } from 'lodash';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { useDeepCompareEffect } from 'react-use';

export interface IChildTableComponentProps extends IChildTableSettingsProps, IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
}

const settingsForm = settingsFormJson as FormMarkup;

const ChildTableComponent: IToolboxComponent<IChildTableComponentProps> = {
  type: 'childTable',
  name: 'Child Table',
  icon: <TableOutlined />,
  factory: (model: IChildTableComponentProps, componentRef: MutableRefObject<any>) => {
    const { formData, formMode, isComponentHidden } = useForm();
    const { columns, setPredefinedFilters } = useDataTable();

    const { globalState } = useGlobalState();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const { defaultSelectedFilterId, filters, permissions } = model;

    componentRef.current = {
      columns,
    };

    //#region Filters
    const hasFilters = filters?.length > 0;

    const foundDynamicFilter = hasDynamicFilter(filters);

    const hasManyFiltersButNoSelected = hasFilters && !defaultSelectedFilterId;

    const hasFormData = !isEmpty(formData);
    const hasGlobalState = !isEmpty(formData);

    const evaluateDynamicFiltersHelper = () => {
      const data = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

      const evaluatedFilters = evaluateDynamicFilters(filters, [
        {
          match: 'data',
          data: data,
        },
        {
          match: 'globalState',
          data: globalState,
        },
      ]);

      let parsedFilters = evaluatedFilters;

      if (defaultSelectedFilterId) {
        parsedFilters = evaluatedFilters?.map(filter => {
          const localFilter = { ...filter };

          if (localFilter.id === defaultSelectedFilterId) {
            localFilter.defaultSelected = true;
            localFilter.selected = true;
          }

          return localFilter;
        });
      } else {
        const firstElement = evaluatedFilters[0];

        firstElement.defaultSelected = true;
        firstElement.selected = true;

        evaluatedFilters[0] = firstElement;
      }

      if (hasFormData || hasGlobalState) {
        // Here we know we have evaluated our filters

        // TODO: Deal with the situation whereby the expression value evaluated to empty string because the action GetData will fail
        setPredefinedFilters(parsedFilters);
      } else if (!foundDynamicFilter) {
        // Here we do not need dynamic filters
        setPredefinedFilters(parsedFilters);
      }
    };

    useDeepCompareEffect(() => {
      if (hasFilters) {
        evaluateDynamicFiltersHelper();
      }
    }, [model?.filters, formData, globalState]);
    //#endregion

    const granted = anyOfPermissionsGranted(permissions || []);




    const isVisible = !isComponentHidden(model) && (granted || formMode == 'designer');

    return (
      <Fragment>
        <Show when={formMode === 'designer'}>
          <Show when={!hasFormData && foundDynamicFilter}>
            <Alert
              style={{ marginBottom: 6 }}
              type="warning"
              message="Found dynamic filters but no state"
              description="Please note that you have dynamic filter(s) but there is no state to evaluate the filter. The table will not be filtered as a result."
            />
          </Show>

          <Show when={hasManyFiltersButNoSelected}>
            <Alert
              style={{ marginBottom: 6 }}
              type="warning"
              message="No selected filter"
              description="Please note you more than one filter and no one is selected. The first one will be used by default"
            />
          </Show>
        </Show>

        <Show when={isVisible}>
          <CollapsiblePanel
            key={undefined}
            header={evaluateString(model?.title, formData)}
            extra={
              <div onClick={e => e?.stopPropagation()}>
                <Space size="middle">
                  <Show when={model?.allowQuickSearch}>
                    <GlobalTableFilter />
                  </Show>

                  <TablePager />

                  <ButtonGroup
                    items={model?.toolbarItems || []}
                    name={''}
                    type={''}
                    id={model.id}
                    isInline={model?.isInline}
                  />
                </Space>
              </div>
            }
            noContentPadding
            className="sha-form-designer-child-table"
          >
            <ComponentsContainer
              containerId={model.id}
              dynamicComponents={
                model?.isDynamic ? model?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []
              }
            />
          </CollapsiblePanel>
        </Show>
      </Fragment>
    );
  },

  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ChildDataTableSettings
        readOnly={readOnly}
        model={(model as unknown) as IChildTableSettingsProps}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    ...model,
    isNotWrapped: true,
  }),
  migrator: m =>
    m
      .add<IChildTableComponentProps>(0, prev => {
        return {
          ...prev,
          isNotWrapped: prev['isNotWrapped'] ?? true,
          defaultSelectedFilterId: null,
        };
      })
      .add<IChildTableComponentProps>(1, migrateV0toV1)
      .add<IChildTableComponentProps>(2, migrateV1toV2),
};

export default ChildTableComponent;
