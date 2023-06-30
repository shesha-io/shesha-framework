import { Alert, Space } from 'antd';
import React, { FC, Fragment, MutableRefObject, useEffect } from 'react';
import { CollapsiblePanel, GlobalTableFilter, Show, TablePager } from 'components';
import {
  useDataTable,
  useForm,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
  useSheshaApplication,
} from 'providers';
import ComponentsContainer from 'components/formDesigner/containers/componentsContainer';
import { hasDynamicFilter } from 'providers/dataTable/utils';
import './styles/index.less';
import { ButtonGroup } from 'components/formDesigner/components/button/buttonGroup/buttonGroupComponent';
import camelCaseKeys from 'camelcase-keys';
import _, { isEmpty } from 'lodash';
import { useDeepCompareEffect } from 'react-use';
import { IChildTableComponentProps } from '.';
import { evaluateString } from 'providers/form/utils';
import { evaluateDynamicFilters, getValidDefaultBool } from 'utils';
import { DEFAULT_DT_USER_CONFIG } from 'providers/dataTable/contexts';

export interface IChildTableProps extends IChildTableComponentProps {
  componentRef: MutableRefObject<any>;
}

export const ChildTable: FC<IChildTableProps> = (props) => {
  const { formData, formMode, isComponentHidden } = useForm();
  const { columns, setPredefinedFilters, modelType, changePageSize, totalRows } = useDataTable();

  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const { defaultSelectedFilterId, filters, permissions, componentRef, defaultPageSize, totalRecords, showPagination } =
    props;

  useEffect(() => {
    if (getValidDefaultBool(showPagination) && defaultPageSize && defaultPageSize !== DEFAULT_DT_USER_CONFIG.pageSize) {
      changePageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  useEffect(() => {
    if (!getValidDefaultBool(showPagination) && totalRecords) {
      changePageSize(totalRecords);
    }
  }, [totalRecords]);

  componentRef.current = {
    columns,
  };

  //#region Filters
  const hasFilters = filters?.length > 0;

  const foundDynamicFilter = hasDynamicFilter(filters);

  const hasManyFiltersButNoSelected = hasFilters && !defaultSelectedFilterId;

  const hasFormData = !isEmpty(formData);
  const hasGlobalState = !isEmpty(formData);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const evaluateDynamicFiltersHelper = () => {
    const data = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: data },
        { match: 'globalState', data: globalState },
      ],
      propertyMetadataAccessor
    ).then((evaluatedFilters) => {
      let parsedFilters = evaluatedFilters;

      if (defaultSelectedFilterId) {
        parsedFilters = evaluatedFilters?.map((filter) => {
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
    });
  };

  useDeepCompareEffect(() => {
    if (hasFilters) {
      evaluateDynamicFiltersHelper();
    }
  }, [props?.filters, formData, globalState]);
  //#endregion

  const showTablePager =
    getValidDefaultBool(showPagination) || (!getValidDefaultBool(showPagination) && totalRows > totalRecords);

  const granted = anyOfPermissionsGranted(permissions || []);

  const isVisible = !isComponentHidden(props) && (granted || formMode === 'designer');

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
          header={evaluateString(props?.title, formData)}
          extra={
            <div onClick={(e) => e?.stopPropagation()}>
              <Space size="middle">
                <Show when={props?.allowQuickSearch}>
                  <GlobalTableFilter />
                </Show>

                {showTablePager && <TablePager />}

                <ButtonGroup
                  items={props?.toolbarItems || []}
                  name={''}
                  type={''}
                  id={props.id}
                  isInline={props?.isInline}
                />
              </Space>
            </div>
          }
          noContentPadding
          className="sha-form-designer-child-table"
        >
          <ComponentsContainer
            containerId={props.id}
            dynamicComponents={
              props?.isDynamic ? props?.components?.map((c) => ({ ...c, readOnly: props?.readOnly })) : []
            }
          />
        </CollapsiblePanel>
      </Show>
    </Fragment>
  );
};

export default ChildTable;
